import { BaseError } from '../base';

export interface InvalidUserIdErrorDetails {
  userId: string;
}

export class InvalidUserIdError extends BaseError<InvalidUserIdErrorDetails> {
  public readonly code = 'INVALID_USER_ID' as const;
  public readonly statusCode = 400 as const;

  constructor(details: InvalidUserIdErrorDetails) {
    super('INVALID_USER_ID', {
      statusCode: 400,
      details
    });
  }
}
