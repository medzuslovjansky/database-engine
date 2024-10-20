import path from 'node:path';

import fs from 'fs-extra';
import type { Auth } from 'googleapis';
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';

import { CREDENTIALS_FILENAME, SCOPES, USER_TOKEN_FILENAME } from './constants';
import type { GoogleAuthStrategy } from './GoogleAuthStrategy';

export class GoogleLocalAuthStrategy implements GoogleAuthStrategy {
  private readonly cwd: string;
  private readonly credentialsPath: string;
  private readonly tokenPath: string;

  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
    this.credentialsPath = path.join(this.cwd, CREDENTIALS_FILENAME);
    this.tokenPath = path.join(this.cwd, USER_TOKEN_FILENAME);
  }

  async authorize(): Promise<Auth.AuthClient> {
    let client = await this._loadCached();
    if (!client) {
      client = await authenticate({
        scopes: SCOPES,
        keyfilePath: this.credentialsPath,
      });

      await this._saveCredentials(client);
    }

    return client;
  }

  async applies(): Promise<boolean> {
    return fs.existsSync(this.tokenPath) || fs.existsSync(this.credentialsPath);
  }

  private async _loadCached(): Promise<Auth.AuthClient | null> {
    const tokenPath = this.tokenPath;
    if (fs.existsSync(tokenPath)) {
      const content = await fs.promises.readFile(tokenPath, 'utf8');
      return google.auth.fromJSON(JSON.parse(content));
    }

    return null;
  }

  private async _saveCredentials(client: Auth.AuthClient) {
    if (!client.credentials) {
      return;
    }

    const credentialsPath = path.join(this.cwd, CREDENTIALS_FILENAME);
    const content = await fs.readFile(credentialsPath, 'utf8');
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });

    await fs.writeFile(this.tokenPath, payload);
  }
}
