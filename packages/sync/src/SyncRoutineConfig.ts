import type { SheetsCache } from '@interslavic/database-engine-csv';
import type { Spreadsheet } from '@interslavic/database-engine-google';
import type { Config } from '@interslavic/database-engine-fs';

export type SyncRoutineConfig = {
  readonly configManager: Config;
  readonly sheetsCache: SheetsCache;
  readonly googleSheets: Spreadsheet;
};
