import 'zx/globals';
import googleapis, { sheets_v4 } from 'googleapis';
import Sheets = sheets_v4.Sheets;
import { SHEET_IDs } from "./constants";

const google = googleapis.google;

export class GoogleSheets {
  static async updateSameInLanguages(values: string[]) {
    const client = await authorize();
    if (!client) {
      return;
    }

    const sheets = google.sheets({ version: 'v4', auth: client });
    await doUpdateSameInLanguages(sheets, values);
  }

  static async testReading() {
    const client = await authorize();
    if (!client) {
      return;
    }

    const sheets = google.sheets({ version: 'v4', auth: client });
    await testReading(sheets);
  }
}


/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @param {google.sheets.Sheets} sheets
 */
async function testReading(sheets: Sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_IDs.new_interslavic_words_list,
    range: 'words',
  });
  const rows = res.data.values;
  debugger;
  return rows;
}

async function doUpdateSameInLanguages(sheets: Sheets, values: string[]) {
  const res = await sheets.spreadsheets.values.update({
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

export async function updateSameInLanguages(values: string[]) {
  const auth = await authorize();
  if (!auth) {
    throw new Error('Failed to authorize');
  }

  const sheets = new Sheets({ auth });
  await testReading(sheets);
  await doUpdateSameInLanguages(sheets, values);
}
