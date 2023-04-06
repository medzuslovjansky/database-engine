import path from 'node:path';

import fs from 'fs-extra';
import yaml from 'yaml';

import type {
  AggregatedConfig,
  SecretsConfig,
  SpreadsheetConfig,
  UsersConfig,
} from '../dto';
import type { ConfigVisitorAsync } from '../types';

export class SerializerVisitor implements ConfigVisitorAsync {
  constructor(protected readonly rootDirectory: string) {}

  async visitAggregatedConfig(config: AggregatedConfig): Promise<void> {
    await fs.ensureDir(this.rootDirectory);

    if (Object.keys(config.spreadsheets).length > 0) {
      await fs.ensureDir(path.join(this.rootDirectory, 'spreadsheets'));
    }
  }

  async visitUsersConfig(users: UsersConfig): Promise<void> {
    const yamlContent = yaml.stringify(users);
    await fs.writeFile(path.join(this.rootDirectory, 'users.yml'), yamlContent);
  }

  async visitSpreadsheetConfig(id: string, config: SpreadsheetConfig) {
    const yamlContent = yaml.stringify(config);
    await fs.writeFile(
      path.join(this.rootDirectory, 'spreadsheets', `${id}.yml`),
      yamlContent,
    );
  }

  async visitSecretsConfig(secrets: SecretsConfig): Promise<void> {
    const yamlContent = yaml.stringify(secrets);
    await fs.writeFile(
      path.join(this.rootDirectory, 'secrets.yml'),
      yamlContent,
    );
  }
}
