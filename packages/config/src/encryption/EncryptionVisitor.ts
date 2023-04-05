import {createCipheriv, randomBytes} from "crypto";
import type {UserConfig} from "../dto";
import type {ConfigVisitor} from "../types";

export class EncryptionVisitor implements ConfigVisitor {
  constructor(private readonly _key: string) {}

  visitUserConfig(user: UserConfig): void {
    user.email = this._encryptValue(user.email);
  }

  private _encryptValue(value: string): string {
    if (!value) return value;

    const initVector = randomBytes(16);
    const cipher = createCipheriv(
      'aes-256-ctr',
      Buffer.from(this._key, 'hex'),
      initVector,
    );

    const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
    return `${initVector.toString('base64')}.${encrypted.toString('base64')}`;
  }
}
