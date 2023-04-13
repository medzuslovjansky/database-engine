import { EncryptionVisitor } from './EncryptionVisitor';
import { DecryptionVisitor } from './DecryptionVisitor';

export class CryptoVisitors {
  constructor(protected readonly encryptionKey: string) {}

  public readonly encrypt = new EncryptionVisitor(this.encryptionKey);
  public readonly decrypt = new DecryptionVisitor(this.encryptionKey);
}
