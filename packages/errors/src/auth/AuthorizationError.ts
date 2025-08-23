import { BaseError } from '../base';

export class AuthorizationError extends BaseError {
  public readonly code = 'AUTHORIZATION_ERROR' as const;
  public readonly statusCode = 403 as const;

  constructor() {
    super('AUTHORIZATION_ERROR', { statusCode: 403 });
  }
}
