import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import type { CryptoService } from '../types';

export class AES256CTRService implements CryptoService {
  /**
   * @param key Encryption key
   */
  constructor(private readonly key: string) {}

  public encrypt(value: string): string {
    if (!value) return value;

    const initVector = randomBytes(16);
    const cipher = createCipheriv(
      'aes-256-ctr',
      Buffer.from(this.key, 'hex'),
      initVector,
    );

    const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
    return `${initVector.toString('base64')}.${encrypted.toString('base64')}`;
  }

  public decrypt(value: string): string {
    if (!value) return value;

    const [iv, encrypted] = value.split('.');
    const decipher = createDecipheriv(
      'aes-256-ctr',
      Buffer.from(this.key, 'hex'),
      Buffer.from(iv, 'base64'),
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString();
  }
}
