import { sheets_v4 } from 'googleapis';

import type { AuthClient } from './auth';
import { Spreadsheet } from './sheets';

export type GoogleAPIsConfig = {
  authClient: AuthClient;
};

export class GoogleAPIs {
  private readonly _authClient: AuthClient;

  constructor(config: GoogleAPIsConfig) {
    this._authClient = config.authClient;
  }

  spreadsheet(id: string) {
    const api = new sheets_v4.Sheets({
      auth: this._authClient,
    });

    return new Spreadsheet({ api, spreadsheetId: id });
  }
}
