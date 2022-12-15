import fs from 'fs';

import { google } from 'googleapis';

import { JWT_TOKEN_FILENAME, SCOPES } from './constants';
import { GoogleAuthStrategy } from './GoogleAuthStrategy';

export class GoogleServiceAccountAuthStrategy implements GoogleAuthStrategy {
  constructor(
    private readonly cwd: string = process.cwd(),
    private readonly env: NodeJS.ProcessEnv = process.env,
  ) {}

  private readonly jwtTokenPath = `${this.cwd}/${JWT_TOKEN_FILENAME}`;

  jwtToken: string | null = null;

  async authorize() {
    this.jwtToken = this.jwtToken ?? (await this._readJWTToken());
    if (!this.jwtToken) {
      throw new Error('JWT_TOKEN is not set');
    }

    const credentials = JSON.parse(this.jwtToken);
    const client = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
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
      return await fs.promises.readFile(this.jwtTokenPath, 'utf8');
    }

    return null;
  }
}
