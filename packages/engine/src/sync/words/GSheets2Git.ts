import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';

import type { WordsDTO, WordsSheet } from '../../google';
import { toMultiSynset } from '../../google';
import { amends, amendedBy } from '../../symbols';
import { IdSyncOperation } from '../core';

export type GSheets2GitOptions = {
  readonly beta: boolean;
  readonly fs: MultilingualSynsetRepository;
  readonly gsheets: WordsSheet;
};

export class GSheets2Git extends IdSyncOperation<number> {
  private _gmap?: Map<number, WordsDTO>;
  private readonly fs: MultilingualSynsetRepository;
  private readonly gsheets: WordsSheet;
  private readonly beta: boolean;

  constructor(options: GSheets2GitOptions) {
    super();

    this.fs = options.fs;
    this.gsheets = options.gsheets;
    this.beta = options.beta;
  }

  protected async delete(id: number): Promise<void> {
    // TODO: think about the future when lemma IDs and synset IDs diverge
    await this.fs.deleteById(id);
  }

  protected async getAfterIds(): Promise<number[]> {
    return this._grecords().then((r) => [...r.keys()]);
  }

  protected async getBeforeIds(): Promise<number[]> {
    return this.fs.keys();
  }

  protected async insert(id: number): Promise<void> {
    const dto = await this._grecords().then((r) => r.get(id));
    const multisynset = toMultiSynset(dto!);
    await this.fs.insert(multisynset);
  }

  protected async update(id: number): Promise<void> {
    const dto = await this._grecords().then((r) => r.get(id));
    const multisynset = toMultiSynset(dto!);
    await this.fs.upsert(multisynset);
  }

  private async _grecords(): Promise<Map<number, WordsDTO>> {
    if (!this._gmap) {
      const dtos = await this.gsheets.getValues();
      const stable = dtos.filter((dto: WordsDTO) => dto.id > 0);
      const grecords = (this._gmap = new Map<number, WordsDTO>(
        stable.map((dto: WordsDTO) => [Number(dto.id), dto]),
      ));

      if (this.beta) {
        const beta = dtos.filter((dto: WordsDTO) => dto.id < 0);
        for (const record of beta) {
          const id = (record.id = -record.id);
          const base = grecords.get(id) as WordsDTO;
          if (base) {
            base[amendedBy] = record;
            record[amends] = base;
          }
          grecords.set(id, record);
        }
      }
    }

    return this._gmap;
  }
}
