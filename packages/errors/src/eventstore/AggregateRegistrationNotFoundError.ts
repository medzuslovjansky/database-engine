import { BaseError } from '../base';

export interface AggregateRegistrationNotFoundErrorDetails {
  aggregateType: string;
}

export class AggregateRegistrationNotFoundError extends BaseError<AggregateRegistrationNotFoundErrorDetails> {
  public readonly code = 'AGGREGATE_REGISTRATION_NOT_FOUND' as const;

  constructor(public readonly aggregateType: string) {
    super('AGGREGATE_REGISTRATION_NOT_FOUND', {
      details: { aggregateType }
    });
  }
}
