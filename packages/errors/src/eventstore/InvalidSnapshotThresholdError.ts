import { BaseError } from '../base';

export interface InvalidSnapshotThresholdErrorDetails {
  threshold: number;
}

export class InvalidSnapshotThresholdError extends BaseError<InvalidSnapshotThresholdErrorDetails> {
  public readonly code = 'INVALID_SNAPSHOT_THRESHOLD' as const;

  constructor(public readonly threshold: number) {
    super('INVALID_SNAPSHOT_THRESHOLD', {
      details: { threshold }
    });
  }
}
