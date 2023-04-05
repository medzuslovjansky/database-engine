import type {ConfigManager} from "./ConfigManager";
import {DecryptionVisitor, EncryptionVisitor} from "../encryption";

export class SecretsManager {
  constructor(protected readonly manager: ConfigManager) {
  }

  get config() {
    return this.manager.config.secrets;
  }

  updateEncryptionKey(newKey: string | undefined): void {
    this.config.encryptionKey = newKey;
  }

  async decryptConfig() {
    if (!this.config.encryptionKey) {
      return;
    }

    const visitor = new DecryptionVisitor(this.config.encryptionKey);
    await this.manager.accept(visitor);
  }

  async encryptConfig() {
    if (!this.config.encryptionKey) {
      return;
    }

    const visitor = new EncryptionVisitor(this.config.encryptionKey);
    await this.manager.accept(visitor);
  }
}
