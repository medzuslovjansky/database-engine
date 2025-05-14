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

  async load<T extends AggregateRoot>(streamOrId: string | StreamIdentifier): Promise<T | null> {
    const result = await this.loadBatch<T>([streamOrId]);
    return result[0] ?? null;
  }

  async loadBatch<T extends AggregateRoot>(streamsOrIds: Array<string | StreamIdentifier>): Promise<T[]> {
    const streams = streamsOrIds.map(streamOrId =>
      typeof streamOrId === 'string' ? StreamIdentifier.fromString(streamOrId) : streamOrId
    );

    // Initialize with default values
    const streamStates = new Map<string, { state?: AggregateState, revision: number }>();
    for (const stream of streams) {
      streamStates.set(stream.toString(), { revision: 0 });
    }

    // Load snapshots for all streams if available
    if (this.config.snapshotStore && streams.length > 0) {
      const snapshots = await this.config.snapshotStore.getLatest(streams);
      for (const snapshot of snapshots) {
        const streamKey = snapshot.stream.toString();
        streamStates.set(streamKey, {
          state: snapshot.data,
          revision: snapshot.revision
        });
      }
    }

    // Instantiate aggregates from snapshots or empty state
    const aggregates: T[] = [];
    const streamPointers: StreamPointer[] = [];

    for (const stream of streams) {
      const streamKey = stream.toString();
      const { state, revision } = streamStates.get(streamKey) || { revision: 0 };

      const aggregate = this.config.aggregateRegistry
        .instantiate<AggregateState, T>(stream, revision, state);

      aggregates.push(aggregate);
      streamPointers.push({ stream, revision });
    }

    // Load events for all streams
    if (streamPointers.length > 0) {
      for await (const events of this.config.eventStore.readStreams(streamPointers)) {
        if (!events.length) continue;

        // Group events by stream
        const eventsByStream = new Map<string, EventEnvelope[]>();
        for (const event of events) {
          const streamKey = event.stream.toString();
          if (!eventsByStream.has(streamKey)) {
            eventsByStream.set(streamKey, []);
          }
          eventsByStream.get(streamKey)?.push(event);
        }

        // Apply events to the appropriate aggregate
        for (let i = 0; i < aggregates.length; i++) {
          const streamKey = streams[i].toString();
          const streamEvents = eventsByStream.get(streamKey);
          if (streamEvents?.length) {
            aggregates[i].loadFromHistory(streamEvents);
          }
        }
      }
    }

    return aggregates;
  }

  async save<S extends AggregateState = AggregateState>(aggregate: AggregateRoot<S>): Promise<void> {
    const events = aggregate.pullEvents();
    if (events.length > 0) {
      this.config.unitOfWork.stageEvents(events);
      this.#maybeStageSnapshot(aggregate, events);
    }
  }

  async saveBatch(aggregates: AggregateRoot[]): Promise<void> {
    for (const aggregate of aggregates) {
      const events = aggregate.pullEvents();
      if (events.length > 0) {
        this.config.unitOfWork.stageEvents(events);
        this.#maybeStageSnapshot(aggregate, events);
      }
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
