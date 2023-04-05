import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';

import type {
  AggregatedConfig,
  SecretsConfig,
  SpreadsheetsConfig,
  UsersConfig
} from "../dto";

export class ConfigLoader {
  constructor(private readonly rootDir: string) {}

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
    const filePath = path.join(this.rootDir, 'secrets.yml');
    if (await fs.exists(filePath)) {
      return yaml.parse(await fs.readFile(filePath, 'utf8'));
    }

    return {};
  }

  private async _loadSpreadsheets(): Promise<SpreadsheetsConfig> {
    const spreadsheetsDir = path.join(this.rootDir, 'spreadsheets');
    if (await fs.exists(spreadsheetsDir)) {
      const spreadsheetsFiles = await fs.readdir(spreadsheetsDir);
      const spreadsheets = await Promise.all(spreadsheetsFiles.map(async (file) => {
        const spreadSheetId = path.basename(file, '.yml');
        const spreadSheetConfigPath = path.join(this.rootDir, spreadsheetsDir, file);
        const spreadSheetConfig = yaml.parse(await fs.readFile(spreadSheetConfigPath, 'utf8'));
        return [spreadSheetId, spreadSheetConfig];
      }));

      return Object.fromEntries(spreadsheets);
    }

    return {};
  }

  private async _loadUsers(): Promise<UsersConfig> {
    const filePath = path.join(this.rootDir, 'users.yml');
    if (await fs.exists(filePath)) {
      return yaml.parse(await fs.readFile(filePath, 'utf8'));
    }

    return {};
  }
}
