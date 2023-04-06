import path from 'node:path';

import fs from 'fs-extra';
import yaml from 'yaml';

import type {
  AggregatedConfig,
  SecretsConfig,
  SpreadsheetsConfig,
  UsersConfig,
} from '../dto';

export class ConfigLoader {
  constructor(private readonly rootDirectory: string) {}

  async load(): Promise<AggregatedConfig> {
    const secrets = await this._loadSecrets();
    const spreadsheets = await this._loadSpreadsheets();
    const users = await this._loadUsers();

    return {
      secrets,
      spreadsheets,
      users,
    };
  }

  private async _loadSecrets(): Promise<SecretsConfig> {
    const filePath = path.join(this.rootDirectory, 'secrets.yml');
    if (await fs.exists(filePath)) {
      return yaml.parse(await fs.readFile(filePath, 'utf8'));
    }

    return {};
  }

  private async _loadSpreadsheets(): Promise<SpreadsheetsConfig> {
    const spreadsheetsDirectory = path.join(this.rootDirectory, 'spreadsheets');
    if (await fs.exists(spreadsheetsDirectory)) {
      const spreadsheetsFiles = await fs.readdir(spreadsheetsDirectory);
      const spreadsheets = await Promise.all(
        spreadsheetsFiles.map(async (file) => {
          const spreadSheetId = path.basename(file, '.yml');
          const spreadSheetConfigPath = path.join(
            this.rootDirectory,
            spreadsheetsDirectory,
            file,
          );
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

  private async _loadUsers(): Promise<UsersConfig> {
    const filePath = path.join(this.rootDirectory, 'users.yml');
    if (await fs.exists(filePath)) {
      return yaml.parse(await fs.readFile(filePath, 'utf8'));
    }

    return {};
  }
}
