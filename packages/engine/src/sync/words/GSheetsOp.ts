import { IdSyncOperation } from '../core';
import type { WordsDTO, WordsSheet } from '../../google';
import { amendedBy, amends } from '../../symbols';

export type GSheetsOpOptions = {
  readonly beta: boolean;
  readonly gsheets: WordsSheet;
};

export abstract class GSheetsOp extends IdSyncOperation<number> {
  private _gmap?: Map<number, WordsDTO>;
  protected readonly gsheets: WordsSheet;
  protected readonly beta: boolean;

  protected constructor(options: Readonly<GSheetsOpOptions>) {
    super();
    this.beta = options.beta;
    this.gsheets = options.gsheets;
  }

  protected async _grecords(): Promise<Map<number, WordsDTO>> {
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

  protected async _gids(): Promise<number[]> {
    return this._grecords().then((r) => [...r.keys()]);
  }
}
