import type SheetsCache from './SheetsCache';
import type GoogleSheetsAPI from './GoogleSheetsAPI';

export type SyncRoutineConfig = {
  readonly sheetsCache: SheetsCache;
  readonly googleSheets: GoogleSheetsAPI;
};
