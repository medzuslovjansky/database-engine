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

  async getEditors() {
    const res = await this.drive.permissions.list({
      fileId: SHEET_IDs.new_interslavic_words_list,
    });

    return res.data.permissions;
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
