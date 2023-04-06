import type { AggregatedConfigManager } from './AggregatedConfigManager';

export class SpreadsheetsManager {
  constructor(protected readonly manager: AggregatedConfigManager) {}

  get config() {
    return this.manager.config.spreadsheets;
  }
}
