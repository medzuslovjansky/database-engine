import type { D1Database } from '@cloudflare/workers-types';
import type {
  Event,
  Snapshot,
  UnitOfWork as PlatformDomainUnitOfWork, // Aliased to be explicit
} from '@interslavic/database-engine-eventstore';
import type { D1EventStore } from './D1EventStore';
import type { D1SnapshotStore } from './D1SnapshotStore';
import { D1UnitOfWork } from './D1UnitOfWork'; // The low-level D1 batcher

export interface D1PlatformUnitOfWorkOptions {
  db: D1Database;
  eventStore: D1EventStore;
  snapshotStore: D1SnapshotStore;
  /** Optional: if not provided, a new D1UnitOfWork will be created internally. */
  d1UnitOfWork?: D1UnitOfWork;
}

/**
 * Implements the domain-level UnitOfWork for D1, coordinating D1EventStore and D1SnapshotStore.
 * It uses the low-level D1UnitOfWork to batch database operations.
 */
export class D1PlatformUnitOfWork implements PlatformDomainUnitOfWork {
  private readonly eventStore: D1EventStore;
  private readonly snapshotStore: D1SnapshotStore;
  private readonly d1InternalUoW: D1UnitOfWork; // The low-level D1 statement batcher

  constructor(options: Readonly<D1PlatformUnitOfWorkOptions>) {
    this.eventStore = options.eventStore;
    this.snapshotStore = options.snapshotStore;
    this.d1InternalUoW = options.d1UnitOfWork || new D1UnitOfWork({ db: options.db });
  }

  stageEvents(events: Event[]): void {
    if (events.length === 0) return;
    this.eventStore.append(events, this.d1InternalUoW);
  }

  stageSnapshots(snapshots: Snapshot[]): void {
    if (snapshots.length === 0) return;
    this.snapshotStore.stageSnapshots(snapshots, this.d1InternalUoW);
  }

  async commit(): Promise<void> {
    await this.d1InternalUoW.commit();
  }

  /**
   * Gets the number of pending D1PreparedStatements in the internal low-level D1UnitOfWork.
   */
  getPendingStatementCount(): number {
    return this.d1InternalUoW.getPendingStatementCount();
  }

  /**
   * Clears all pending D1PreparedStatements from the internal low-level D1UnitOfWork.
   */
  clear(): void {
    this.d1InternalUoW.clear();
  }
}
