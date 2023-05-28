import type { sheets_v4 } from 'googleapis';

import { Sheet } from './Sheet';
import { BatchExecutor } from './BatchExecutor';

export type SpreadsheetConfig = {
  api: sheets_v4.Sheets;
  spreadsheetId: string;
};

export class Spreadsheet {
  public readonly id: string;

  private readonly _api: sheets_v4.Sheets;
  private readonly _batch: BatchExecutor;
  private _namedRanges?: sheets_v4.Schema$NamedRange[];
  private _sheets?: Sheet[];

  constructor(config: SpreadsheetConfig) {
    this.id = config.spreadsheetId;

    this._api = config.api;
    this._batch = new BatchExecutor({
      api: this._api,
      spreadsheetId: this.id,
    });
  }

  async load() {
    const res = await this._api.spreadsheets.get({
      spreadsheetId: this.id,
      ranges: [],
      includeGridData: false,
    });

    this._namedRanges = res.data.namedRanges ?? [];
    this._sheets = (res.data.sheets ?? []).map(
      (s) =>
        new Sheet({
          spreadsheetId: this.id,
          api: this._api,
          batch: this._batch.clone({
            sheetId: s.properties!.sheetId!,
          }),
          properties: s.properties!,
          protectedRanges: s.protectedRanges ?? [],
        }),
    );
  }

  async getNamedRanges() {
    if (!this._namedRanges) {
      await this.load();
    }

    return this._namedRanges!;
  }

  async getSheets() {
    if (!this._sheets) {
      await this.load();
    }

    return this._sheets!;
  }

  async getSheetById(id: number) {
    const sheets = await this.getSheets();
    return sheets.find((s) => s.id === id);
  }

  async getSheetByTitle(title: string) {
    const sheets = await this.getSheets();
    return sheets.find((s) => s.title === title);
  }

  async flush() {
    await this._batch.flush();
  }
}
