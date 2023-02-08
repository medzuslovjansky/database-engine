import { UserConfig } from './UserConfig';
import { RangeConfig } from './RangeConfig';

export type SheetsConfig = {
  users: Record<string, UserConfig>;
  ranges: RangeConfig[];
};
