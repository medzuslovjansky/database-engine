import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when a stream ID has an invalid format
 */
export class InvalidStreamIdFormatError extends EventStoreError {
  constructor(streamId: string) {
    super(`Invalid stream ID format: ${streamId}. Expected "prefix/id"`);
  }
}
