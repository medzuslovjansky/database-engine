import { createCipheriv, createDecipheriv } from 'node:crypto';

import type { CryptoService } from '../types';

export class AES256CTRService implements CryptoService {
  private readonly key: Buffer;
  private readonly initVector: Buffer;

  /**
   * @param key Encryption key
   */
  constructor(key: string, initVector: string) {
    this.key = Buffer.from(key, 'hex');
    this.initVector = Buffer.from(initVector, 'hex');
  }

  public encrypt(value: string): string {
    if (!value) return value;

    const cipher = createCipheriv('aes-256-ctr', this.key, this.initVector);
    const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
    return encrypted.toString('base64');
  }

  public decrypt(value: string): string {
    if (!value) return value;

    const decipher = createDecipheriv('aes-256-ctr', this.key, this.initVector);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(value, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString();
  }
}
