import { BaseError } from '../base';

export class InvalidTokenError extends BaseError {
  public readonly code = 'INVALID_TOKEN' as const;
  public readonly statusCode = 401 as const;

  constructor() {
    super('INVALID_TOKEN', { statusCode: 401 });
  }
}
