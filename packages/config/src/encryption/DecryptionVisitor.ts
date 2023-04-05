import {createDecipheriv} from "crypto";

import type {UserConfig} from "../dto";
import type {ConfigVisitor} from "../types";

export class DecryptionVisitor implements ConfigVisitor {
  constructor(private readonly _key: string) {}

  visitUserConfig(user: UserConfig): void {
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
