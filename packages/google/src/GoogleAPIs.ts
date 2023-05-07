import { drive_v3, sheets_v4 } from 'googleapis';

import type { AuthClient } from './auth';
import { Spreadsheet } from './sheets';
import { DriveDocument } from './drive';

export type GoogleAPIsConfig = {
  authClient: AuthClient;
};

export class GoogleAPIs {
  private readonly _authClient: AuthClient;

  constructor(config: GoogleAPIsConfig) {
    this._authClient = config.authClient;
  }

  driveDocument(id: string) {
    const api = new drive_v3.Drive({
      auth: this._authClient,
    });

    return new DriveDocument({ api, fileId: id });
  }

  spreadsheet(id: string) {
    const api = new sheets_v4.Sheets({
      auth: this._authClient,
    });

    return new Spreadsheet({ api, spreadsheetId: id });
  }
}
