import { BaseError } from '../base';

export interface DuplicateProjectionRegistrationErrorDetails {
  projectionName: string;
}

export class DuplicateProjectionRegistrationError extends BaseError<DuplicateProjectionRegistrationErrorDetails> {
  public readonly code = 'DUPLICATE_PROJECTION_REGISTRATION' as const;

  constructor(public readonly projectionName: string) {
    super('DUPLICATE_PROJECTION_REGISTRATION', {
      details: { projectionName }
    });
  }
}
