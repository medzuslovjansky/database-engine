import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when a projection fails to flush its state
 */
export class ProjectionFlushError extends EventStoreError {
  constructor(projectionName: string, eventId: number, cause?: unknown) {
    super(`Projection "${projectionName}" failed to flush at event ${eventId}`, { cause });
  }
}
