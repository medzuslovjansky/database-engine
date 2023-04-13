import type { SheetsCache } from '@interslavic/razumlivost-csv';
import type { Spreadsheet } from '@interslavic/razumlivost-google';
import type { Config } from '@interslavic/razumlivost-database';

export type SyncRoutineConfig = {
  readonly configManager: Config;
  readonly sheetsCache: SheetsCache;
  readonly googleSheets: Spreadsheet;
};
