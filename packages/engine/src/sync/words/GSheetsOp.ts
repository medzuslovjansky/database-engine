import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';

import { IdSyncOperation } from '../core';
import type {
  WordsAddLangDTO,
  WordsAddLangRecord,
  WordsAddLangSheet,
  WordsDTO,
  WordsRecord,
  WordsSheet,
} from '../../google';
import { log } from '../../utils';

export type GSheetsOpOptions = {
  readonly words: WordsSheet;
  readonly wordsAddLang?: WordsAddLangSheet;
  readonly selectedIds?: number[];
  readonly multisynsets: MultilingualSynsetRepository;
  /** Disables deletion of entities */
  readonly partialSync: boolean;
};

type TableDTO = WordsRecord | WordsAddLangRecord;

export abstract class GSheetsOp extends IdSyncOperation<number> {
  private _words?: Promise<Map<number, WordsDTO>>;
  private _wordsAdd?: Promise<Map<number, WordsAddLangDTO>>;
  private _maxId?: Promise<number>;
  protected readonly wordsSheet: WordsSheet;
  protected readonly wordsAddLangSheet?: WordsAddLangSheet;
  protected readonly multisynsets: MultilingualSynsetRepository;
  protected readonly selectedIds?: Set<number>;

  protected constructor(options: Readonly<GSheetsOpOptions>) {
    super();

    this.wordsSheet = options.words;
    this.wordsAddLangSheet = options.wordsAddLang;
    this.multisynsets = options.multisynsets;
    if (options.selectedIds) {
      this.selectedIds = new Set(options.selectedIds);
    }
    if (options.partialSync) {
      this.delete = async () => {};
    }
  }

  protected async beginTransaction(): Promise<void> {
    await this.words();
    await this.wordsAdd();
  }

  protected async maxFsId(): Promise<number> {
    if (!this._maxId) {
      // eslint-disable-next-line unicorn/no-array-reduce
      this._maxId = this.multisynsets.keys().then((keys) => keys.reduce((a, b) => Math.max(Math.abs(a), Math.abs(b)), 0));
    }

    return this._maxId;
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
      this._wordsAdd = this.wordsAddLangSheet
        ? this._getRecords(this.wordsAddLangSheet)
        : Promise.resolve(new Map());
    }

    return this._wordsAdd;
  }

  private async _getRecords<DTO extends TableDTO>(
    sheet: WordsSheet | WordsAddLangSheet,
  ): Promise<Map<number, DTO>> {
    return log.trace.complete(
      { cat: ['gsheets'], tid: ['sync', sheet.id] },
      `fetch ${sheet.title}`,
      async () => {
        let maxFsId = await this.maxFsId();
        const dtos = (await sheet.getValues()) as unknown as DTO[];
        const grecords = new Map(
          dtos
            .map((dto) => {
              let id = Math.abs(+dto.id);
              if (Number.isNaN(id)) {
                id = ++maxFsId;
                dto.id = id.toString();
              }

              return [id, dto];
            }),
        );

        return grecords;
      },
    );
  }
}
