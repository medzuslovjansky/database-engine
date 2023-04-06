import { cloneDeep } from 'lodash';

import type { AggregatedConfig } from '../dto';
import type { ConfigVisitor, ConfigVisitorSync } from '../types';

export class AggregatedConfigStructure {
  constructor(protected readonly config: AggregatedConfig) {}

  clone(): AggregatedConfigStructure {
    return new AggregatedConfigStructure(cloneDeep(this.config));
  }

  acceptSync(visitor: ConfigVisitorSync): this {
    visitor.visitAggregatedConfig?.(this.config);

    visitor.visitSecretsConfig?.(this.config.secrets);

    visitor.visitUsersConfig?.(this.config.users);
    if (visitor.visitUserConfig) {
      const users = Object.entries(this.config.users);
      for (const [id, userConfig] of users) {
        visitor.visitUserConfig?.(id, userConfig);
      }
    }

    visitor.visitSpreadsheetsConfig?.(this.config.spreadsheets);
    if (visitor.visitSpreadsheetConfig) {
      const spreadsheets = Object.entries(this.config.spreadsheets);
      for (const [id, spreadsheetConfig] of spreadsheets) {
        visitor.visitSpreadsheetConfig?.(id, spreadsheetConfig);
      }
    }

    return this;
  }

  async acceptAsync(visitor: ConfigVisitor): Promise<this> {
    await visitor.visitAggregatedConfig?.(this.config);

    await visitor.visitSecretsConfig?.(this.config.secrets);

    await visitor.visitUsersConfig?.(this.config.users);

    if (visitor.visitUserConfig) {
      const users = Object.entries(this.config.users);
      for (const [id, userConfig] of users) {
        await visitor.visitUserConfig?.(id, userConfig);
      }
    }

    await visitor.visitSpreadsheetsConfig?.(this.config.spreadsheets);

    if (visitor.visitSpreadsheetConfig) {
      const spreadsheets = Object.entries(this.config.spreadsheets);
      for (const [id, spreadsheetConfig] of spreadsheets) {
        await visitor.visitSpreadsheetConfig?.(id, spreadsheetConfig);
      }
    }

    return this;
  }
}
