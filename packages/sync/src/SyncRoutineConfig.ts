import type SheetsCache from './cache/SheetsCache';
import type GoogleSheetsAPI from './sheets/GoogleSheetsAPI';
import type { ConfigManager } from './config/ConfigManager';

export type SyncRoutineConfig = {
  readonly configManager: ConfigManager;
  readonly sheetsCache: SheetsCache;
  readonly googleSheets: GoogleSheetsAPI;
};
