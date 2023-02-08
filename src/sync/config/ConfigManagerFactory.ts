import { promises as fs } from 'fs';

import { ConfigManager, ConfigManagerConfig } from './ConfigManager';

export class ConfigManagerFactory {
  public static async createConfigManagerFromPath(
    config?: Partial<ConfigManagerConfig>,
  ): Promise<ConfigManager> {
    const encryptionKey =
      config?.encryptionKey ??
      process.env.ISV_ENCRYPTION_KEY ??
      (await fs.readFile('.config_encryption_key', 'utf8'));

    const decryptionKey = config?.decryptionKey ?? encryptionKey;

    const configFilePath = config?.configFilePath ?? 'sheets.config.yml';

    return this.createConfigManager({
      encryptionKey,
      decryptionKey,
      configFilePath,
    });
  }

  public static createConfigManager(
    config: ConfigManagerConfig,
  ): ConfigManager {
    return new ConfigManager(config);
  }
}
