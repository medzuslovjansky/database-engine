import { drive_v3, sheets_v4 } from 'googleapis';
import { SHEET_IDs } from '../utils/constants';
import Sheets = sheets_v4.Sheets;
import Drive = drive_v3.Drive;

export default class GoogleSheetsAPI {
  constructor(private readonly authClient: any) {}

  private readonly drive = new Drive({
    auth: this.authClient,
  });

  private readonly sheets = new Sheets({
    auth: this.authClient,
  });

  async getNamedRanges() {
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId: SHEET_IDs.interslavic_intelligibility,
      ranges: [],
      includeGridData: false,
    });

    return res.data.namedRanges;
  }

  async getProtectedRanges() {
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId: SHEET_IDs.interslavic_intelligibility,
      ranges: [],
      includeGridData: false,
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

  async getEditors() {
    const res = await this.drive.permissions.list({
      fileId: SHEET_IDs.interslavic_intelligibility,
      fields: '*',
    });

    const editors =
      res.data.permissions?.filter((p) => p.id && p.id !== 'anyoneWithLink');

    return editors ?? [];
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

  async testReading() {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_IDs.new_interslavic_words_list,
      range: 'words',
    });

    return res.data.values;
  }
}
