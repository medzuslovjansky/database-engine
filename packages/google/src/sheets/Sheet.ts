import { camelCase, upperFirst } from 'lodash';
import type { sheets_v4 } from 'googleapis';

import type { ArrayMapped, ArrayMapper } from '../utils/createArrayMapperClass';
import { createArrayMapperClass } from '../utils/createArrayMapperClass';

import type { BatchExecutor } from './BatchExecutor';
import type { SheetRecord } from './SheetRecord';

export type SheetConfig = {
  api: sheets_v4.Sheets;
  batch: BatchExecutor;
  spreadsheetId: string;
  properties: sheets_v4.Schema$SheetProperties;
  protectedRanges: sheets_v4.Schema$ProtectedRange[];
};

export type Sheet$GetValuesOptions = {
  range?: string;
};

export class Sheet<T extends SheetRecord = SheetRecord> {
  private readonly _api: sheets_v4.Sheets;
  private readonly _batch: BatchExecutor;
  private readonly _properties: sheets_v4.Schema$SheetProperties;
  private _arrayMapper?: ArrayMapper<T>;

  public readonly protectedRanges: sheets_v4.Schema$ProtectedRange[];
  public readonly spreadsheetId: string;

  constructor(config: SheetConfig) {
    this._api = config.api;
    this._batch = config.batch;
    this._properties = config.properties;

    this.spreadsheetId = config.spreadsheetId;
    this.protectedRanges = config.protectedRanges;
  }

  get id(): number {
    return this._properties.sheetId!;
  }

  get title(): string {
    return this._properties.title!;
  }

  async getValues(): Promise<ArrayMapped<T>[]> {
    const res = await this._api.spreadsheets.values.get({
      range: this.title,
      spreadsheetId: this.spreadsheetId,
    });

    const values = res.data.values ?? [];
    const Mapper = this._ensureMapper(values);
    values.shift();
    // eslint-disable-next-line unicorn/no-array-callback-reference
    return values.map(Mapper.mapFn) as ArrayMapped<T>[];
  }

  async flush(): Promise<void> {
    await this._batch.flush();
  }

  private _ensureMapper([headers]: unknown[][]) {
    if (!this._arrayMapper) {
      const mapperClassName = `${upperFirst(camelCase(this.title))}Mapper`;
      this._arrayMapper = createArrayMapperClass(
        mapperClassName,
        headers.map(String),
      );
    }

    return this._arrayMapper;
  }

  // async updateSameInLanguages(values: string[]) {
  //   const res = await this._api.spreadsheets.values.update({
  //     spreadsheetId: SHEET_IDs.new_interslavic_words_list,
  //     range: 'words!Y2:Y',
  //     includeValuesInResponse: false,
  //     valueInputOption: 'RAW',
  //     requestBody: {
  //       majorDimension: 'COLUMNS',
  //       values: [values],
  //     },
  //   });
  //
  //   console.log(`Update status: ${res.statusText}`);
  // }
}
