import type {SecretsConfig} from "./SecretsConfig";
import type {SpreadsheetsConfig} from "./SpreadsheetsConfig";
import type {UsersConfig} from "./UsersConfig";

export type AggregatedConfig = {
  secrets: SecretsConfig;
  users: UsersConfig;
  spreadsheets: SpreadsheetsConfig;
};
