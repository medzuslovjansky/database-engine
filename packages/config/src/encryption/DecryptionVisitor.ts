import { createDecipheriv } from 'node:crypto';

import type { UserConfig, UserID } from '../dto';
import type { ConfigVisitorSync } from '../types';

export class DecryptionVisitor implements ConfigVisitorSync {
  constructor(private readonly _key: string) {}

  visitUserConfig(_id: UserID, user: UserConfig): void {
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
