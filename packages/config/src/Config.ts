import { DecryptionVisitor, EncryptionVisitor } from './encryption';
import { ConfigLoader, SerializerVisitor } from './serialization';
import { AggregatedConfigManager } from './managers/AggregatedConfigManager';
import { AggregatedConfigStructure } from './utils';
import type { AggregatedConfig } from './dto';

export class Config {
  protected manager: AggregatedConfigManager;
  protected structure: AggregatedConfigStructure;
  public config: AggregatedConfig;

  constructor(protected readonly rootDirectory: string) {}

  public get secrets() {
    return this.manager.secrets;
  }

  public get users() {
    return this.manager.users;
  }

  public get spreadsheets() {
    return this.manager.spreadsheets;
  }

  async load() {
    const loader = new ConfigLoader(this.rootDirectory);
    this.config = await loader.load();
    this.structure = new AggregatedConfigStructure(this.config);
    this._decryptConfig();
  }

  async save() {
    const encrypted = this._encryptConfig();
    await encrypted.acceptAsync(new SerializerVisitor(this.rootDirectory));
  }

  private get _encryptionKey(): string | undefined {
    return this.config.secrets.encryptionKey;
  }

  private _decryptConfig() {
    const encryptionKey = this._encryptionKey;
    if (encryptionKey) {
      const visitor = new DecryptionVisitor(encryptionKey);
      this.structure.acceptSync(visitor);
    }
  }

  private _encryptConfig() {
    const encryptionKey = this._encryptionKey;
    if (encryptionKey) {
      const visitor = new EncryptionVisitor(encryptionKey);
      return this.structure.clone().acceptSync(visitor);
    } else {
      return this.structure;
    }
  }
}
