import type { CryptoService } from '../types';

export class CryptoMigrationService implements CryptoService {
  constructor(
    protected readonly from: CryptoService,
    protected readonly to: CryptoService,
  ) {}

  decrypt(value: string): string {
    return this.from.decrypt(value);
  }

  encrypt(value: string): string {
    return this.to.encrypt(value);
  }
}
