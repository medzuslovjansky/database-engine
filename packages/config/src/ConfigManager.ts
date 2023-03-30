import { promises as fs } from 'fs';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import cloneDeep from 'lodash/cloneDeep';
import findKey from 'lodash/findKey';
import merge from 'lodash/merge';
import yaml from 'yaml';

import { SheetsConfig } from './SheetsConfig';
import { UserConfig } from './UserConfig';

export type ConfigManagerConfig = {
  decryptionKey?: string;
  encryptionKey?: string;
  configFilePath: string;
};

export class ConfigManager {
  private _data?: SheetsConfig;

  constructor(private readonly _config: ConfigManagerConfig) {}

  public get config() {
    return this._data;
  }

  public async load(): Promise<SheetsConfig> {
    if (!this._data) {
      const filePath = this._config.configFilePath;
      const file = await fs.readFile(filePath, 'utf8');
      this._data = yaml.parse(file) as SheetsConfig;
      this._decrypt();
    }

    return this._data;
  }

  public async save(): Promise<void> {
    if (!this._data) return;
    const filePath = this._config.configFilePath;
    await fs.writeFile(filePath, yaml.stringify(this._encrypt()));
  }

  public addUser(id: string, user: UserConfig): void {
    const data = this._data;

    if (data) {
      data.users ??= {};
      data.users[id] = user;
    }
  }

  public updateUserById(id: string, user: UserConfig): void {
    const data = this._data;

    if (data) {
      data.users ??= {};
      merge(data.users[id], user);
    }
  }

  public updateUserByEmail(email: string, user: UserConfig): void {
    const id = this._findIdByEmail(email);
    if (id) {
      this.updateUserById(id, user);
    }
  }

  public removeUserById(id: string): void {
    if (this._data?.users) {
      delete this._data.users[id];
    }
  }

  public removeUserByEmail(email: string): void {
    const id = this._findIdByEmail(email);
    if (id) {
      this.removeUserById(id);
    }
  }

  private _findIdByEmail(email: string): string | undefined {
    return findKey(this._data?.users, { email });
  }

  private _decrypt(): void {
    const key = this._config.decryptionKey || this._config.encryptionKey;

    if (key) {
      this._forEachUser(this._data, (user) => {
        user.email = this._decryptValue(key, user.email);
      });
    }
  }

  private _encrypt(): SheetsConfig | undefined {
    const key = this._config.encryptionKey;

    if (key) {
      const data = cloneDeep(this._data);

      this._forEachUser(data, (user) => {
        user.email = this._encryptValue(key, user.email);
      });

      return data;
    }

    return this._data;
  }

  private _forEachUser(
    data: SheetsConfig | undefined,
    fn: (user: UserConfig) => void,
  ) {
    if (data && data.users) {
      for (const user of Object.values(data.users)) {
        fn(user);
      }
    }
  }

  private _decryptValue(key: string, value: string): string {
    if (!value) return value;

    const [iv, encrypted] = value.split('.');
    const decipher = createDecipheriv(
      'aes-256-ctr',
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'base64'),
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString();
  }

  private _encryptValue(key: string, value: string): string {
    if (!value) return value;

    const initVector = randomBytes(16);
    const cipher = createCipheriv(
      'aes-256-ctr',
      Buffer.from(key, 'hex'),
      initVector,
    );

    const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
    return `${initVector.toString('base64')}.${encrypted.toString('base64')}`;
  }
}
