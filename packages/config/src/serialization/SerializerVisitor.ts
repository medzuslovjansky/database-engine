import fs from 'fs-extra';
import path from 'path';

import yaml from 'yaml';

import type {
  AggregatedConfig,
  SecretsConfig,
  SpreadsheetConfig,
  UsersConfig
} from "../dto";

import type {ConfigVisitor} from "../types";

export class SerializerVisitor implements ConfigVisitor {
  constructor(protected readonly rootDir: string) {
  }

  async visitAggregatedConfig(config: AggregatedConfig): Promise<void> {
    await fs.ensureDir(this.rootDir);

    if (Object.keys(config.spreadsheets).length) {
      await fs.ensureDir(path.join(this.rootDir, 'spreadsheets'));
    }
  }

  async visitUsersConfig(users: UsersConfig): Promise<void> {
    const yamlContent = yaml.stringify(users);
    await fs.writeFile(path.join(this.rootDir, 'users.yml'), yamlContent);
  }

  async visitSpreadsheetConfig(id: string, config: SpreadsheetConfig) {
    const yamlContent = yaml.stringify(config);
    await fs.writeFile(path.join(this.rootDir, 'spreadsheets', `${id}.yml`), yamlContent);
  }

  async visitSecretsConfig(secrets: SecretsConfig): Promise<void> {
    const yamlContent = yaml.stringify(secrets);
    await fs.writeFile(path.join(this.rootDir, 'secrets.yml'), yamlContent);
  }
}
