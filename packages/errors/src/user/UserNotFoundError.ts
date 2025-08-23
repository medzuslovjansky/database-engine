import { BaseError } from '../base';

export interface UserNotFoundErrorDetails {
  userId: string;
}

export class UserNotFoundError extends BaseError<UserNotFoundErrorDetails> {
  public readonly code = 'USER_NOT_FOUND' as const;
  public readonly statusCode = 404 as const;

  constructor(details: UserNotFoundErrorDetails) {
    super('USER_NOT_FOUND', {
      statusCode: 404,
      details
    });
  }
}
