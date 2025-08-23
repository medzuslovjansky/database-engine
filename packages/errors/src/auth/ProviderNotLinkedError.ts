import { BaseError } from '../base';

export class ProviderNotLinkedError extends BaseError {
  public readonly code = 'PROVIDER_NOT_LINKED' as const;
  public readonly statusCode = 401 as const;

  constructor() {
    super('PROVIDER_NOT_LINKED', { statusCode: 401 });
  }
}
