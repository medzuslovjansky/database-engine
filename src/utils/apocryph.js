const _ = require('lodash');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

const LANGS_ORDER = [
  'CS',
  'CZ',
  'SK',
  'PL',
  'CSB',
  'HSB',
  'DSB',
  'BE',
  'RU',
  'UA',
  'UK',
  'RUE',
  'SL',
  'HR',
  'SR',
  'MK',
  'BG',
  'PMK',
  'POM',
];

function parseLang(rawLang) {
  if (!rawLang) return;

  const lang = rawLang.trim().toUpperCase();
  const valid = LANGS_ORDER.find((l) => l === lang);
  const semivalid = LANGS_ORDER.find((l) => lang.includes(l));
  const result = valid || semivalid;
  if (!result) return;

  if (result === 'CZ') return 'CS';
  if (result === 'UA') return 'UK';
  if (result === 'PMK' || result === 'POM') return 'POMAK';
  return result;
}

function parseVerdict(value) {
  value = value || '';

  if (value === 'DA' || value === 'NE') {
    return value;
  }
  if (value.startsWith('~DA')) {
    return '~DA';
  }

  return 'ODGOVOR';
}

function getDefaultAnswers(value) {
  return {
    CS: [],
    SK: [],
    PL: [],
    CSB: [],
    HSB: [],
    DSB: [],
    BE: [],
    RU: [],
    UK: [],
    RUE: [],
    SL: [],
    HR: [],
    SR: [],
    MK: [],
    BG: [],
    POMAK: [],
    ...value,
  };
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listMajors(auth) {
  const drive = google.drive({ version: 'v3', auth });

  const folderId = '1i37Fs4FbAyFgjiUgzDoQhUpYY0okybZQ';
  const folder = await drive.files.list({ q: `'${folderId}' in parents` });
  const aktivny = folder.data.files.find((f) => f.name === 'aktivny');
  const folder2 = await drive.files.list({ q: `'${aktivny.id}' in parents` });
  const folderSheets = folder2.data.files.filter(
    (f) => f.mimeType === 'application/vnd.google-apps.spreadsheet',
  );

  const sheets = google.sheets({ version: 'v4', auth });
  for (const sheetFile of folderSheets) {
    console.log(sheetFile.name);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetFile.id,
      range: 'A:D',
    });
    const records = response.data.values
      .slice(1)
      .map(([time, email, lang, verdict]) => ({
        time,
        email,
        lang: parseLang(lang),
        verdict: parseVerdict(verdict),
      }))
      .filter((e) => e.lang);

    console.log(
      _.chain(records)
        .groupBy('lang')
        .thru(getDefaultAnswers)
        .mapValues((v) => v.map((i) => i.verdict).sort())
        .value(),
    );
  }
}

authorize().then(listMajors).catch(console.error);
