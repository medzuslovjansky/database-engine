import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';

import { IdSyncOperation } from '../core';
import type {
  WordsAddLangDTO,
  WordsAddLangSheet,
  WordsDTO,
  WordsSheet,
} from '../../google';
import { beta } from '../../symbols';
import { log } from '../../utils';

export type GSheetsOpOptions = {
  readonly beta: boolean;
  readonly words: WordsSheet;
  readonly wordsAddLang: WordsAddLangSheet;
  readonly selectedIds?: number[];
  readonly multisynsets: MultilingualSynsetRepository;
};

type BetaDTO = WordsDTO | WordsAddLangDTO;

function isBeta(dto: BetaDTO): boolean {
  return dto.id >= 37_000;
}

function isStable(dto: BetaDTO): boolean {
  return !isBeta(dto);
}

function all(): boolean {
  return true;
}

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
    return log.trace.complete(
      { cat: ['gsheets'], tid: ['sync', sheet.id] },
      `fetch ${sheet.title}`,
      async () => {
        const dtos = (await sheet.getValues()) as unknown as DTO[];
        const grecords = new Map<number, DTO>(
          dtos.filter(this.beta ? all : isStable).map((dto) => {
            if (isBeta(dto)) {
              dto[beta] = true;
            }

            return [Number(dto.id), dto];
          }),
        );

        return grecords;
      },
    );
  }
}
