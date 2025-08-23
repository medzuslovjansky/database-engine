import { BaseError } from '../base';

export interface DuplicateAggregateRegistrationErrorDetails {
  aggregateType: string;
}

export class DuplicateAggregateRegistrationError extends BaseError<DuplicateAggregateRegistrationErrorDetails> {
  public readonly code = 'DUPLICATE_AGGREGATE_REGISTRATION' as const;

  constructor(public readonly aggregateType: string) {
    super('DUPLICATE_AGGREGATE_REGISTRATION', {
      details: { aggregateType }
    });
  }
}
