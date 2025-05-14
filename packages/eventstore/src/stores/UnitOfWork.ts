import type {EventEnvelope, SnapshotEnvelope} from '../envelopes';

export interface UnitOfWork {
  stageEvents(events: EventEnvelope[]): void;
  stageSnapshots(snapshots: SnapshotEnvelope[]): void;

  commit(): Promise<void>;
}
