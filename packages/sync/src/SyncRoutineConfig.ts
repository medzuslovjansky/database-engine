import type { SheetsCache } from '@interslavic/razumlivost-csv';
import type { SheetsDocument } from '@interslavic/razumlivost-google';
import type { Config } from '@interslavic/razumlivost-config';

export type SyncRoutineConfig = {
  readonly configManager: Config;
  readonly sheetsCache: SheetsCache;
  readonly googleSheets: SheetsDocument;
};
