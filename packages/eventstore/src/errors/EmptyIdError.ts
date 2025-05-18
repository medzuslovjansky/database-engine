import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when an ID is empty
 */
export class EmptyIdError extends EventStoreError {
  constructor() {
    super('ID cannot be empty');
  }
}
