import { BaseError } from '../base';

export interface ValidationErrorDetails {
  details?: any;
}

export class ValidationError extends BaseError<ValidationErrorDetails> {
  public readonly code = 'VALIDATION_ERROR' as const;
  public readonly statusCode = 400 as const;

  constructor(details: ValidationErrorDetails) {
    super('VALIDATION_ERROR', {
      statusCode: 400,
      details
    });
  }
}
