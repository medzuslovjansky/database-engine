import type {
  AggregatedConfig,
  SecretsConfig,
  SpreadsheetConfig,
  SpreadsheetID,
  SpreadsheetsConfig,
  UserConfig, UserID,
  UsersConfig
} from "../dto";

export interface ConfigVisitor {
  visitAggregatedConfig?(config: AggregatedConfig): void | Promise<void>;
  visitSecretsConfig?(config: SecretsConfig): void | Promise<void>;
  visitSpreadsheetConfig?(id: SpreadsheetID, config: SpreadsheetConfig): void | Promise<void>;
  visitSpreadsheetsConfig?(config: SpreadsheetsConfig): void | Promise<void>;
  visitUserConfig?(id: UserID, config: UserConfig): void | Promise<void>;
  visitUsersConfig?(config: UsersConfig): void | Promise<void>;
}
