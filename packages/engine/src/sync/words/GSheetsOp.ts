import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';

import { IdSyncOperation } from '../core';
import type {
  WordsAddLangDTO,
  WordsAddLangSheet,
  WordsDTO,
  WordsSheet,
} from '../../google';
import { amends, beta } from '../../symbols';

export type GSheetsOpOptions = {
  readonly beta: boolean;
  readonly words: WordsSheet;
  readonly wordsAddLang: WordsAddLangSheet;
  readonly selectedIds?: number[];
  readonly multisynsets: MultilingualSynsetRepository;
};

type BetaDTO = WordsDTO | WordsAddLangDTO;

export abstract class GSheetsOp extends IdSyncOperation<number> {
  private _words?: Promise<Map<number, WordsDTO>>;
  private _wordsAdd?: Promise<Map<number, WordsAddLangDTO>>;
  protected readonly wordsSheet: WordsSheet;
  protected readonly wordsAddLangSheet: WordsAddLangSheet;
  protected readonly beta: boolean;
  protected readonly multisynsets: MultilingualSynsetRepository;
  protected readonly selectedIds?: Set<number>;

  protected constructor(options: Readonly<GSheetsOpOptions>) {
    super();

    this.beta = options.beta;
    this.wordsSheet = options.words;
    this.wordsAddLangSheet = options.wordsAddLang;
    this.multisynsets = options.multisynsets;
    if (options.selectedIds) {
      this.selectedIds = new Set(options.selectedIds);
    }
  }

  protected async wordIds(): Promise<number[]> {
    return this.words().then((r) => [...r.keys()]);
  }

  protected async words(): Promise<Map<number, WordsDTO>> {
    if (!this._words) {
      this._words = this._getRecords(this.wordsSheet);
    }

    return this._words;
  }

  protected async wordsAdd(): Promise<Map<number, WordsAddLangDTO>> {
    if (!this._wordsAdd) {
      this._wordsAdd = this._getRecords(this.wordsAddLangSheet);
    }

    return this._wordsAdd;
  }

  private async _getRecords<DTO extends BetaDTO>(
    sheet: WordsSheet | WordsAddLangSheet,
  ): Promise<Map<number, DTO>> {
    const dtos = (await sheet.getValues()) as unknown as DTO[];
    const stable = dtos.filter((dto) => dto.id > 0);
    const grecords = new Map<number, DTO>(
      stable.map((dto) => [Number(dto.id), dto]),
    );

    if (this.beta) {
      const betaRecords = dtos.filter((dto) => dto.id < 0);
      for (const record of betaRecords) {
        record[beta] = true;

        const id = (record.id = -record.id);
        const base = grecords.get(id) as WordsDTO;
        if (base) {
          record[amends] = base;
        }
        grecords.set(id, record);
      }
    }

    return grecords;
  }
}
