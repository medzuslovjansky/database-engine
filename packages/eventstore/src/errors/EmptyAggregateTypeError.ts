import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when an aggregate type is empty
 */
export class EmptyAggregateTypeError extends EventStoreError {
  constructor() {
    super('Aggregate type cannot be empty');
  }
}
