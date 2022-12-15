import fs from 'fs-extra';
import path from 'path';

import { Auth, google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';

import { CREDENTIALS_FILENAME, SCOPES } from './constants';
import { GoogleAuthStrategy } from './GoogleAuthStrategy';

export class GoogleLocalAuthStrategy implements GoogleAuthStrategy {
  constructor(private readonly cwd = process.cwd()) {}

  private readonly tokenPath = path.join(this.cwd, 'user.secret.json');
  private readonly keyfilePath = path.join(this.cwd, CREDENTIALS_FILENAME);

  async authorize(): Promise<Auth.AuthClient> {
    let client = await this._loadCached();
    if (!client) {
      client = await this._authenticate();
      await this._saveCredentials(client);
    }

    return client;
  }

  private async _loadCached(): Promise<Auth.AuthClient | null> {
    const tokenPath = this.tokenPath;
    if (fs.existsSync(tokenPath)) {
      const content = await fs.promises.readFile(tokenPath, 'utf8');
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    }
    return null;
  }

  private async _authenticate(): Promise<Auth.AuthClient> {
    const keyfilePath = this.keyfilePath;
    return authenticate({
      scopes: SCOPES,
      keyfilePath,
    });
  }

  private async _saveCredentials(client: Auth.AuthClient) {
    if (!client.credentials) {
      return;
    }

    const keyfilePath = path.join(this.cwd, CREDENTIALS_FILENAME);
    const content = await fs.readFile(keyfilePath, 'utf8');
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });

    const tokenPath = path.join(this.cwd, 'user.secret.json');
    await fs.writeFile(tokenPath, payload);
  }
}
