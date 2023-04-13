import path from 'node:path';

import fs from 'fs-extra';
import yaml from 'yaml';

import type { Secrets, Spreadsheet, Users } from '../dto';
import type { DatabaseVisitorAsync } from '../types';

export class SerializerVisitor implements DatabaseVisitorAsync {
  constructor(protected readonly rootDirectory: string) {}

  async visitAggregated(): Promise<void> {
    await fs.ensureDir(this.rootDirectory);
    await fs.ensureDir(path.join(this.rootDirectory, 'spreadsheets'));
  }

  async visitUsers(users: Users): Promise<void> {
    const yamlContent = yaml.stringify(users);
    await fs.writeFile(path.join(this.rootDirectory, 'users.yml'), yamlContent);
  }

  async visitSpreadsheet(id: string, config: Spreadsheet) {
    const yamlContent = yaml.stringify(config);
    await fs.writeFile(
      path.join(this.rootDirectory, 'spreadsheets', `${id}.yml`),
      yamlContent,
    );
  }

  async visitSecrets(secrets: Secrets): Promise<void> {
    const yamlContent = yaml.stringify(secrets);
    await fs.writeFile(
      path.join(this.rootDirectory, 'secrets.yml'),
      yamlContent,
    );
  }
}
