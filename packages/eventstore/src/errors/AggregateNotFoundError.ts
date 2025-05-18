import { EventStoreError } from './EventStoreError';
import { StreamIdentifier } from '../primitives';

/**
 * Error thrown when an aggregate is not found
 */
export class AggregateNotFoundError extends EventStoreError {
  constructor(streamOrId: string | StreamIdentifier) {
    const streamId = typeof streamOrId === 'string' ? streamOrId : streamOrId.toString();
    super(`Aggregate not found for stream: ${streamId}`);
  }
}
