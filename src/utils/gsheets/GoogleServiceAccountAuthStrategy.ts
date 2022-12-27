import fs from 'fs';
import path from 'path';

import { google } from 'googleapis';

import { JWT_TOKEN_FILENAME, SCOPES } from './constants';
import { GoogleAuthStrategy } from './GoogleAuthStrategy';

export class GoogleServiceAccountAuthStrategy implements GoogleAuthStrategy {
  constructor(
    private readonly cwd: string = process.cwd(),
    private readonly env: NodeJS.ProcessEnv = process.env,
  ) {}

  private readonly jwtTokenPath = path.join(this.cwd, JWT_TOKEN_FILENAME);

  jwtToken: string | null = null;

  async authorize() {
    this.jwtToken ??= await this._readJWTToken();
    if (!this.jwtToken) {
      throw new Error('JWT_TOKEN is not set');
    }

    const { client_email, private_key } = JSON.parse(this.jwtToken);
    const client = new google.auth.JWT({
      email: client_email,
      key: private_key,
    }).createScoped(SCOPES);

    await client.authorize();
    return client;
  }

  async _readJWTToken() {
    if (this.env['JWT_TOKEN']) {
      return this.env['JWT_TOKEN'];
    }

    const tokenPath = this.jwtTokenPath;
    if (fs.existsSync(tokenPath)) {
      return await fs.promises.readFile(tokenPath, 'utf8');
    }

    return null;
  }
}
