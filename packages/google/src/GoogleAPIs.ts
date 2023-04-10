import { sheets_v4 } from 'googleapis';

import type { AuthClient } from './auth';
import { Spreadsheet } from './sheets';

export type GoogleAPIsConfig = {
  auth: AuthClient;
};

export class GoogleAPIs {
  private readonly _auth: AuthClient;

  constructor(config: GoogleAPIsConfig) {
    this._auth = config.auth;
  }

  spreadsheet(id: string) {
    const api = new sheets_v4.Sheets({
      auth: this._auth,
    });

    return new Spreadsheet({ api, spreadsheetId: id });
  }
}
