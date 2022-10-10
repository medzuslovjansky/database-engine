import 'zx/globals';
import googleapis from 'googleapis';

const google = googleapis.google;

if (!process.env.JWT_TOKEN) {
  if (fs.existsSync('jwt.secret.json')) {
    process.env.JWT_TOKEN = fs.readFileSync('jwt.secret.json', 'utf8');
  }
}

async function authorize() {
  try {
    const credentials = JSON.parse(process.env.JWT_TOKEN);
    const client = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
    }).createScoped(['https://www.googleapis.com/auth/spreadsheets']);
    await client.authorize();
    return client;
  } catch (err) {
    return null;
  }
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @param {google.sheets.Sheets} sheets
 */
async function testReading(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1N79e_yVHDo-d026HljueuKJlAAdeELAiPzdFzdBuKbY',
    range: 'words!A1:E20',
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  rows.forEach((row) => {
    console.log(row.join('\t'));
  });
}

/**
 * @param {google.sheets.Sheets} sheets
 */
async function doUpdateSameInLanguages(sheets, values) {
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: '1N79e_yVHDo-d026HljueuKJlAAdeELAiPzdFzdBuKbY',
    range: 'Y2:Y',
    includeValuesInResponse: false,
    valueInputOption: 'RAW',
    requestBody: {
      majorDimension: 'COLUMNS',
      values: [values],
    },
  });

  console.log(`Update status: ${res.statusText}`);
}

/**
 * @param {string[]} values
 * @returns {Promise<void>}
 */
export async function updateSameInLanguages(values) {
  const sheets = google.sheets({
    version: 'v4',
    auth: await authorize()
  });

  await doUpdateSameInLanguages(sheets, values);
}
