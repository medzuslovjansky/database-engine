import type { D1UnitOfWork } from '@interslavic/database-engine-database-d1';
import type {
  Event,
  Snapshot,
  UnitOfWork as EventStoreUnitOfWork, // Aliased to be explicit
} from '@interslavic/database-engine-eventstore';

import type { D1EventStore } from './D1EventStore';
import type { D1SnapshotStore } from './D1SnapshotStore';

export interface D1EventStoreUnitOfWorkOptions {
  eventStore: D1EventStore;
  snapshotStore: D1SnapshotStore;
  d1UnitOfWork: D1UnitOfWork;
}

export class D1EventStoreUnitOfWork implements EventStoreUnitOfWork {
  private readonly eventStore: D1EventStore;
  private readonly snapshotStore: D1SnapshotStore;
  private readonly d1InternalUoW: D1UnitOfWork; // The low-level D1 statement batcher

  constructor(options: Readonly<D1EventStoreUnitOfWorkOptions>) {
    this.eventStore = options.eventStore;
    this.snapshotStore = options.snapshotStore;
    this.d1InternalUoW = options.d1UnitOfWork;
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
}
