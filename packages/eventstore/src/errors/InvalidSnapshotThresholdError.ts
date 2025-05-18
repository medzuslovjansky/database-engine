import { EventStoreError } from './EventStoreError';

/**
 * Error thrown when an invalid snapshot threshold is provided
 */
export class InvalidSnapshotThresholdError extends EventStoreError {
  constructor(threshold: number) {
    super(`Snapshot threshold must be at least 1: ${threshold}`);
  }
}
