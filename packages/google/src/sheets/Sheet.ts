import type { sheets_v4 } from 'googleapis';

import type { BatchExecutor } from './BatchExecutor';

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

export class Sheet {
  private readonly _api: sheets_v4.Sheets;
  private readonly _batch: BatchExecutor;
  private readonly _properties: sheets_v4.Schema$SheetProperties;

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

  async getValues(options: Sheet$GetValuesOptions) {
    const res = await this._api.spreadsheets.values.get({
      range: `${this.title}!${options.range ?? ''}`,
      spreadsheetId: this.spreadsheetId,
    });

    return res.data.values;
  }

  async flush() {
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
