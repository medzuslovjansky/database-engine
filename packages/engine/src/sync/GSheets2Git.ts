import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';

import type { WordsDTO, WordsSheet } from '../google';
import { amends, amendedBy } from '../symbols';
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
      const stable = dtos.filter((dto: WordsDTO) => dto.id > 0);
      const grecords = (this._grecords = new Map<number, WordsDTO>(
        stable.map((dto: WordsDTO) => [Number(dto.id), dto]),
      ));

      if (this.beta) {
        const beta = dtos.filter((dto: WordsDTO) => dto.id < 0);
        for (const record of beta) {
          const base = grecords.get(-record.id) as WordsDTO;
          if (base) {
            base[amendedBy] = record;
            record[amends] = base;
          }

          grecords.set(Number(record.id), record);
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
