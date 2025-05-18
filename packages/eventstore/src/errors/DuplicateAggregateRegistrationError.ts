import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when trying to register an aggregate with a prefix that is already registered
 */
export class DuplicateAggregateRegistrationError extends EventStoreError {
  constructor(prefix: string) {
    super(`Duplicate aggregate registration for prefix: ${prefix}`);
  }
}
