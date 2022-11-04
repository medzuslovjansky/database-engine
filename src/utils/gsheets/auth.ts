import { Auth, google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import fs from 'fs';

export interface GoogleAuthStrategy {
  authorize(): Promise<Auth.AuthClient>;
}

export class GoogleServiceAccountAuthStrategy implements GoogleAuthStrategy {
  constructor(private readonly cwd = process.cwd()) {}

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
    }).createScoped([
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ]);

    await client.authorize();
    return client;
  }

  async _readJWTToken() {
    if (process.env['JWT_TOKEN']) {
      return process.env['JWT_TOKEN'];
    }

    const tokenPath = path.join(this.cwd, 'jwt.secret.json');
    if (fs.existsSync(tokenPath)) {
      return await fs.promises.readFile('jwt.secret.json', 'utf8');
    }

    return null;
  }
}

export class GoogleLocalAuthStrategy implements GoogleAuthStrategy {
  constructor(private readonly cwd = process.cwd()) {}

  userCredentials: unknown | null = null;

  async authorize(): Promise<Auth.AuthClient> {
    let client = await this._loadCached();
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
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  private async _loadCached(): Promise<Auth.AuthClient | null> {
    const tokenPath = path.join(this.cwd, 'user.secret.json');
    if (fs.existsSync(tokenPath)) {
      const content = await fs.promises.readFile(tokenPath, 'utf8');
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    }
    return null;
  }

  private async _authenticate() {}
  private async _saveCredentials(client: Auth.AuthClient) {
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
}
