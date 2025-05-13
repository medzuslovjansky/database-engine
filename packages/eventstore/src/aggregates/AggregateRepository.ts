import type {EventEnvelope, SnapshotEnvelope} from '../envelopes';
import { StreamIdentifier } from '../primitives';
import type { SnapshotStrategy } from '../snapshots';
import type { EventStore, SnapshotStore, UnitOfWork } from '../stores';
import type { AggregateState, StreamPointer } from '../types';

import type { AggregateRegistry } from './AggregateRegistry';
import type { AggregateRoot } from './AggregateRoot';

export interface AggregateRepositoryOptions {
  aggregateRegistry: AggregateRegistry;
  eventStore: EventStore;
  unitOfWork: UnitOfWork;
  snapshotStore?: SnapshotStore;
  snapshotStrategy?: SnapshotStrategy;
}

export class AggregateRepository {
  constructor(private readonly config: AggregateRepositoryOptions) {}

  async load<T extends AggregateRoot>(streamOrId: string | StreamIdentifier): Promise<T> {
    const stream = typeof streamOrId === 'string'
      ? StreamIdentifier.fromString(streamOrId)
      : streamOrId;

    let state: AggregateState | undefined = undefined;
    let revision = 0;

    if (this.config.snapshotStore) {
      const [snapshot] = await this.config.snapshotStore.getLatest([stream]);
      if (snapshot) {
        state = snapshot.data;
        revision = snapshot.revision;
      }
    }

    const aggregate = this.config.aggregateRegistry
      .instantiate<AggregateState, T>(stream, state);

    const pointer: StreamPointer = { stream, revision };

    for await (const events of this.config.eventStore.readStream(pointer)) {
      aggregate.loadFromHistory(events);
    }

    return aggregate;
  }

  async save<S extends AggregateState = AggregateState>(aggregate: AggregateRoot<S>): Promise<void> {
    const events = aggregate.pullEvents();
    if (events.length > 0) {
      this.config.unitOfWork.stageEvents(events);
      this.#maybeStageSnapshot(aggregate, events);
    }
  }

  #maybeStageSnapshot(aggregate: AggregateRoot, events: EventEnvelope[]): void {
    if (!this.config.snapshotStore) return;
    if (!this.config.snapshotStrategy) return;

    const snapshot: SnapshotEnvelope = {
      stream: aggregate.stream,
      revision: aggregate.revision,
      ts: Date.now(),
      data: aggregate.state,
    };

    if (this.config.snapshotStrategy.maybeSave(aggregate, events)) {
      this.config.unitOfWork.stageSnapshots([snapshot]);
    }
  }
}
