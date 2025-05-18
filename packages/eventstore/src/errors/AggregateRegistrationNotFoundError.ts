import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when an aggregate registration is not found
 */
export class AggregateRegistrationNotFoundError extends EventStoreError {
  constructor(prefix: string) {
    super(`No aggregate registration found for prefix: ${prefix}`);
  }
}
