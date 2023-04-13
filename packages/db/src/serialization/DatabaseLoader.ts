import path from 'node:path';

import fs from 'fs-extra';
import yaml from 'yaml';

import type {
  AggregatedDatabase,
  Secrets,
  Spreadsheets,
  Users,
} from '../dto';

export class DatabaseLoader {
  constructor(private readonly rootDirectory: string) {}

  async load(): Promise<AggregatedDatabase> {
    const secrets = await this._loadSecrets();
    const spreadsheets = await this._loadSpreadsheets();
    const users = await this._loadUsers();

    return {
      secrets,
      spreadsheets,
      users,
    };
  }

  private async _loadSecrets(): Promise<Secrets> {
    const filePath = path.join(this.rootDirectory, 'secrets.yml');
    if (await fs.exists(filePath)) {
      return yaml.parse(await fs.readFile(filePath, 'utf8'));
    }

    return { encryption_key: '' };
  }

  private async _loadSpreadsheets(): Promise<Spreadsheets> {
    const spreadsheetsDirectory = path.join(this.rootDirectory, 'spreadsheets');
    if (await fs.exists(spreadsheetsDirectory)) {
      const spreadsheetsFiles = await fs.readdir(spreadsheetsDirectory);
      const spreadsheets = await Promise.all(
        spreadsheetsFiles.map(async (file) => {
          const spreadSheetId = path.basename(file, '.yml');
          const spreadSheetConfigPath = path.join(spreadsheetsDirectory, file);
          const spreadSheetConfig = yaml.parse(
            await fs.readFile(spreadSheetConfigPath, 'utf8'),
          );
          return [spreadSheetId, spreadSheetConfig];
        }),
      );

      return Object.fromEntries(spreadsheets);
    }

    return {};
  }

  private async _loadUsers(): Promise<Users> {
    const filePath = path.join(this.rootDirectory, 'users.yml');
    if (await fs.exists(filePath)) {
      return yaml.parse(await fs.readFile(filePath, 'utf8'));
    }

    return {};
  }
}
