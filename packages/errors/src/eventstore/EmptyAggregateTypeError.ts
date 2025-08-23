import { BaseError } from '../base';

export class EmptyAggregateTypeError extends BaseError {
  public readonly code = 'EMPTY_AGGREGATE_TYPE' as const;

  constructor() {
    super('EMPTY_AGGREGATE_TYPE');
  }
}
