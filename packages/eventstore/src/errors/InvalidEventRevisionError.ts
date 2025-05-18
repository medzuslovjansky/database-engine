import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when an event has an invalid revision number
 */
export class InvalidEventRevisionError extends EventStoreError {
  constructor(expected: number, actual: number) {
    super(`Invalid event revision: expected ${expected}, got ${actual}`);
  }
}
