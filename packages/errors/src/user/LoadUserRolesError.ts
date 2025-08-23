import { BaseError } from '../base';

export interface LoadUserRolesErrorDetails {
  error: unknown;
}

export class LoadUserRolesError extends BaseError<LoadUserRolesErrorDetails> {
  public readonly code = 'LOAD_USER_ROLES_ERROR' as const;
  public readonly statusCode = 500 as const;

  constructor(details: LoadUserRolesErrorDetails) {
    super('LOAD_USER_ROLES_ERROR', {
      statusCode: 500,
      details
    });
  }
}
