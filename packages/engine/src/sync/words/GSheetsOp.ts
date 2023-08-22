import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';
import type { ArrayMapped, Notes } from '@interslavic/database-engine-google';

import { IdSyncOperation } from '../core';
import type {
  WordsAddLangRecord,
  WordsAddLangSheet,
  WordsRecord,
  WordsSheet,
} from '../../google';
import { log } from '../../utils';

export type GSheetsOpOptions = {
  readonly beta: boolean;
  readonly words: WordsSheet;
  readonly wordsAddLang: WordsAddLangSheet;
  readonly selectedIds?: number[];
  readonly multisynsets: MultilingualSynsetRepository;
};

type TableDTO = WordsRecord | WordsAddLangRecord;

function isBeta(dto: TableDTO): boolean {
  return dto.id >= 37_000;
}

type Annotated<DTO extends Record<string, any>> = [
  ArrayMapped<DTO>,
  Notes<DTO>,
];

export abstract class GSheetsOp extends IdSyncOperation<number> {
  private _words?: Promise<Map<number, Annotated<WordsRecord>>>;
  private _wordsAdd?: Promise<Map<number, Annotated<WordsAddLangRecord>>>;
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

  protected async words(): Promise<Map<number, Annotated<WordsRecord>>> {
    if (!this._words) {
      this._words = this._getRecords(this.wordsSheet);
    }

    return this._words;
  }

  protected async wordsAdd(): Promise<
    Map<number, Annotated<WordsAddLangRecord>>
  > {
    if (!this._wordsAdd) {
      this._wordsAdd = this._getRecords(this.wordsAddLangSheet);
    }

    return this._wordsAdd;
  }

  private async _getRecords<DTO extends TableDTO>(
    sheet: WordsSheet | WordsAddLangSheet,
  ): Promise<Map<number, Annotated<DTO>>> {
    return log.trace.complete(
      { cat: ['gsheets'], tid: ['sync', sheet.id] },
      `fetch ${sheet.title}`,
      async () => {
        const dtos = (await sheet.getValues()) as unknown as DTO[];
        const notes = (await sheet.getNotes()) as unknown as Notes<DTO>[];
        const grecords = new Map(
          dtos
            .map((dto, index) => {
              if (isBeta(dto) && !this.beta) {
                return;
              }

              const note = notes[index];
              return [Number(dto.id), [dto, note]];
            })
            .filter(Boolean) as [number, Annotated<DTO>][],
        );

        return grecords;
      },
    );
  }
}
