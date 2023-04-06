import type { AggregatedConfigManager } from './AggregatedConfigManager';

export class SecretsManager {
  constructor(protected readonly manager: AggregatedConfigManager) {}

  get config() {
    return this.manager.config.secrets;
  }

  updateEncryptionKey(newKey: string | undefined): void {
    this.config.encryption_key = newKey;
  }
}
