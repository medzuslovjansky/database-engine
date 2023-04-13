import { createDecipheriv } from 'node:crypto';

import type { User } from '../dto';
import type { DatabaseVisitorSync } from '../types';

export class DecryptionVisitor implements DatabaseVisitorSync {
  constructor(private readonly _key: string) {}

  visitUser(user: User): void {
    user.email = this._decryptValue(this._key, user.email);
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
}
