import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when no projections are found for an operation
 */
export class NoProjectionsFoundError extends EventStoreError {
  constructor(operation: string) {
    super(`No projections found to ${operation}`);
  }
}
