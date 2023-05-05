import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';

import type { WordsSheet } from '../google/sheets';
import type { WordsDTO } from '../google';
import { toMultiSynset } from '../google';

import { IdSyncOperation } from './IdSyncOperation';

export class GSheets2Git extends IdSyncOperation<number> {
  private _grecords?: Map<number, WordsDTO>;

  constructor(
    private readonly fs: MultilingualSynsetRepository,
    private readonly gsheets: WordsSheet,
    private readonly beta: boolean,
  ) {
    super();
  }

  private async grecords(): Promise<Map<number, WordsDTO>> {
    if (!this._grecords) {
      const dtos = await this.gsheets.getValues();
      const stable = dtos.filter((dto) => dto.id >= 0);
      this._grecords = new Map(stable.map((dto) => [Number(dto.id), dto]));

      if (this.beta) {
        for (const dto of dtos) {
          if (dto.id >= 0) {
            continue;
          }

          dto.id = -dto.id;
          const existing = this._grecords.get(dto.id);
          if (existing) {
            Object.assign(existing, dto);
            dto.id = -dto.id;
          } else {
            this._grecords.set(dto.id, dto);
          }
        }
      }
    }

    return this._grecords;
  }

  protected async delete(id: number): Promise<void> {
    // TODO: think about the future when lemma IDs and synset IDs diverge
    await this.fs.deleteById(id);
  }

  protected async getAfterIds(): Promise<number[]> {
    return this.grecords().then((r) => [...r.keys()]);
  }

  protected async getBeforeIds(): Promise<number[]> {
    return this.fs.keys();
  }

  protected async insert(id: number): Promise<void> {
    const dto = await this.grecords().then((r) => r.get(id));
    const multisynset = toMultiSynset(dto!);
    await this.fs.insert(multisynset);
  }

  protected async update(id: number): Promise<void> {
    const dto = await this.grecords().then((r) => r.get(id));
    const multisynset = toMultiSynset(dto!);
    await this.fs.upsert(multisynset);
  }
}
