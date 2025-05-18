import type { Event, Snapshot, UnitOfWork } from '../../src';

import { InMemoryEventStore } from './InMemoryEventStore';
import { InMemorySnapshotStore } from './InMemorySnapshotStore';

export interface InMemoryUnitOfWorkConfig {
  eventStore: InMemoryEventStore;
  snapshotStore: InMemorySnapshotStore;
}

export class InMemoryUnitOfWork implements UnitOfWork {
  #stagedEvents: Event[] = [];
  #stagedSnapshots: Snapshot[] = [];
  readonly #eventStore: InMemoryEventStore;
  readonly #snapshotStore: InMemorySnapshotStore;

  constructor(config: InMemoryUnitOfWorkConfig) {
    this.#eventStore = config.eventStore;
    this.#snapshotStore = config.snapshotStore;
  }

  stageEvents(events: Event[]): void {
    this.#stagedEvents.push(...events);
  }

  stageSnapshots(snapshots: Snapshot[]): void {
    this.#stagedSnapshots.push(...snapshots);
  }

  async commit(): Promise<void> {
    if (this.#stagedEvents.length > 0) {
      this.#eventStore.add(this.#stagedEvents);
      this.#stagedEvents = [];
    }

    if (this.#stagedSnapshots.length > 0 && this.#snapshotStore) {
      this.#snapshotStore.addSnapshots(this.#stagedSnapshots);
      this.#stagedSnapshots = [];
    }
  }

  get hasChanges(): boolean {
    return this.#stagedEvents.length > 0 || this.#stagedSnapshots.length > 0;
  }

  get stagedEvents(): Event[] {
    return [...this.#stagedEvents];
  }

  get stagedSnapshots(): Snapshot[] {
    return [...this.#stagedSnapshots];
  }
}
