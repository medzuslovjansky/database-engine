import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when a projection fails during processing
 */
export class ProjectionProcessingError extends EventStoreError {
  constructor(projectionName: string, eventId: number, cause?: unknown) {
    super(`Projection "${projectionName}" failed to process event ${eventId}`, { cause });
  }
}
