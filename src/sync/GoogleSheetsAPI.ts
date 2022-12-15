import { sheets_v4 } from 'googleapis';
import { SHEET_IDs } from '../utils/constants';
import Sheets = sheets_v4.Sheets;

export default class GoogleSheetsAPI {
  constructor(private readonly authClient: any) {}

  private readonly sheets = new Sheets({
    auth: this.authClient,
  });

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
