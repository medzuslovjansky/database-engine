import { BaseError } from '../base';

export class AuthenticationError extends BaseError<void> {
  public readonly code = 'AUTHENTICATION_ERROR' as const;
  public readonly statusCode = 401 as const;

  constructor(details?: void) {
    super('AUTHENTICATION_ERROR', { statusCode: 401, details });
  }
}
