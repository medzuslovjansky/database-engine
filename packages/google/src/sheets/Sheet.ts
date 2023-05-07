import { isEqual, camelCase, upperFirst } from 'lodash';
import type { sheets_v4 } from 'googleapis';

import type { ArrayMapper } from '../utils/createArrayMapperClass';
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
  private _columnHeaders?: unknown[];
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

  protected async ensureColumnHeaders() {
    if (this._columnHeaders) {
      return;
    }

    const res = await this._api.spreadsheets.values.get({
      range: `${this.title}!1:1`,
      spreadsheetId: this.spreadsheetId,
    });

    this._columnHeaders = res.data.values![0];
    const mapperClassName = `${upperFirst(camelCase(this.title))}Mapper`;
    this._arrayMapper = createArrayMapperClass(
      mapperClassName,
      this._columnHeaders.map(String),
    );
  }

  async getValues(options: Sheet$GetValuesOptions = {}): Promise<T[]> {
    await this.ensureColumnHeaders();

    const res = await this._api.spreadsheets.values.get({
      range: options.range ? `${this.title}!${options.range}` : this.title,
      spreadsheetId: this.spreadsheetId,
    });

    const Mapper = this._arrayMapper!;
    const values = res.data.values ?? [];
    if (isEqual(values[0], this._columnHeaders)) {
      values.shift();
    }

    return values.filter((row) => row[0] != null).map((row) => new Mapper(row));
  }

  async flush(): Promise<void> {
    await this._batch.flush();
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
