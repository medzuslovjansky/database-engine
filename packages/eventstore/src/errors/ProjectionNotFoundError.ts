import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when a projection is not found in the registry
 */
export class ProjectionNotFoundError extends EventStoreError {
  constructor(projectionName: string) {
    super(`Projection with name "${projectionName}" not found in registry`);
  }
}
