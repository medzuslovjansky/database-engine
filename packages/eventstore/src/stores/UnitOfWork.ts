import type { Event, Snapshot } from '../envelopes';

/**
 * Represents a unit of work for storing events and snapshots atomically
 */
export interface UnitOfWork {
  /**
   * Stage events to be committed
   * @param events Events to stage for commit
   */
  stageEvents(events: Event[]): void;

  /**
   * Stage snapshots to be committed
   * @param snapshots Snapshots to stage for commit
   */
  stageSnapshots(snapshots: Snapshot[]): void;

  /**
   * Commit all staged events and snapshots atomically
   * @throws if the commit operation fails
   */
  commit(): Promise<void>;
}
