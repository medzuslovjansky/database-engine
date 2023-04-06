import { createCipheriv, randomBytes } from 'node:crypto';

import type { UserConfig, UserID } from '../dto';
import type { ConfigVisitorSync } from '../types';

export class EncryptionVisitor implements ConfigVisitorSync {
  constructor(private readonly _key: string) {}

  visitUserConfig(_id: UserID, user: UserConfig): void {
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
