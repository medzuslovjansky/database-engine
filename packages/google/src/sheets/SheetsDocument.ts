import { sheets_v4 } from 'googleapis';
import { SHEET_IDs } from '../../constants';
import { AuthClient } from '../auth/AuthClient';
import Sheets = sheets_v4.Sheets;

export type SheetsDocumentConfig = {
  authClient: AuthClient;
  spreadsheetId: string;
};

export type GetValuesOptions = {
  range: string;
};

export class SheetsDocument {
  private readonly spreadsheetId: string;
  private readonly sheets: Sheets;

  constructor(config: SheetsDocumentConfig) {
    this.spreadsheetId = config.spreadsheetId;
    this.sheets = new Sheets({
      auth: config.authClient,
    });
  }

  async getNamedRanges() {
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      ranges: [],
      includeGridData: false,
    });

    return res.data.namedRanges;
  }

  async getProtectedRanges() {
    const res = await this.sheets.spreadsheets.get({
      includeGridData: false,
      ranges: [],
      spreadsheetId: this.spreadsheetId,
    });

    return (
      res.data.sheets?.flatMap((s) => {
        return (
          s.protectedRanges?.map((range) => ({
            sheetId: s.properties?.sheetId,
            range,
          })) ?? []
        );
      }) ?? []
    );
  }

  async getValues(options: GetValuesOptions) {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: options.range,
    });

    return res.data.values;
  }

  async updateSameInLanguages(values: string[]) {
    const res = await this.sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_IDs.new_interslavic_words_list,
      range: 'words!Y2:Y',
      includeValuesInResponse: false,
      valueInputOption: 'RAW',
      requestBody: {
        majorDimension: 'COLUMNS',
        values: [values],
      },
    });

    console.log(`Update status: ${res.statusText}`);
  }
}
