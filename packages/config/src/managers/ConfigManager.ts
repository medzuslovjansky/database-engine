import {SecretsManager} from "./SecretsManager";
import {UsersManager} from "./UsersManager";
import type {ConfigVisitor} from "../types";
import type {AggregatedConfig} from "../dto";

export class ConfigManager {
  public readonly secrets = new SecretsManager(this);
  public readonly users = new UsersManager(this);

  constructor(public readonly config: AggregatedConfig) {}

  public async decrypt(): Promise<void> {
    await this.secrets.decryptConfig();
  }

  public async encrypt(): Promise<void> {
    await this.secrets.encryptConfig();
  }

  public async accept(visitor: ConfigVisitor): Promise<void> {
    await visitor.visitAggregatedConfig?.(this.config);

    await visitor.visitSecretsConfig?.(this.config.secrets);
    await visitor.visitUsersConfig?.(this.config.users);

    const users = Object.entries(this.config.users);
    for (const [id, userConfig] of users) {
      await visitor.visitUserConfig?.(id, userConfig);
    }

    await visitor.visitSpreadsheetsConfig?.(this.config.spreadsheets);

    const spreadsheets = Object.entries(this.config.spreadsheets);
    for (const [id, spreadsheetConfig] of spreadsheets) {
      await visitor.visitSpreadsheetConfig?.(id, spreadsheetConfig);
    }
  }
}
