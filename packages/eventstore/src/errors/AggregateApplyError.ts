import type { Event } from '../envelopes';
import type { StreamIdentifier } from '../primitives';

import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when an aggregate is not found
 */
export class AggregateApplyError extends EventStoreError {
  constructor(stream: StreamIdentifier, event: Event, cause?: unknown) {
    super(`Failed to apply event ${event.type} to aggregate ${stream.toString()} in its failed state`, { cause });
  }
}
