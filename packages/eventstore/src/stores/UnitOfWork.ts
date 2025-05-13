import type {EventEnvelope, OutboxEnvelope, SnapshotEnvelope} from '../envelopes';

export interface UnitOfWork {
  stageEvents(events: EventEnvelope[]): void;
  stageOutboxes(messages: OutboxEnvelope[]): void;
  stageSnapshots(snapshots: SnapshotEnvelope[]): void;

  commit(): Promise<void>;
}
