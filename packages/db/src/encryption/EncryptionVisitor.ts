import { createCipheriv, randomBytes } from 'node:crypto';

import type { User } from '../dto';
import type { DatabaseVisitor } from '../types';

export class EncryptionVisitor implements DatabaseVisitor {
  constructor(private readonly _key: string) {}

  visitUser(user: User): void {
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
