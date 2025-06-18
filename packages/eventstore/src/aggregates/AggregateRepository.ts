import type { Event, Snapshot } from '../envelopes';
import { StreamIdentifier } from '../primitives';
import type { EventStore, SnapshotStore, UnitOfWork } from '../stores';
import type { StreamPointer } from '../types';
import { AggregateNotFoundError } from '../errors';

import type { AggregateRegistry } from './AggregateRegistry';
import type { AggregateRoot } from './AggregateRoot';
import type { SnapshotSaveStrategy } from './utils';

export interface AggregateRepositoryOptions {
  aggregateRegistry: AggregateRegistry;
  eventStore: EventStore;
  unitOfWork: UnitOfWork;
  snapshotStore: SnapshotStore;
  shouldSaveSnapshot: SnapshotSaveStrategy;
}

export class AggregateRepository {
  constructor(private readonly config: AggregateRepositoryOptions) {}

  async load<T extends AggregateRoot>(
    streamOrId: string | StreamIdentifier
  ): Promise<T> {
    const [first] = await this.loadBatch<T>([streamOrId]);
    return first;
  }

  async loadBatch<T extends AggregateRoot>(
    streamsOrIds: Array<string | StreamIdentifier>
  ): Promise<T[]> {
    const streams = streamsOrIds.map(streamOrId =>
      typeof streamOrId === 'string' ? StreamIdentifier.fromString(streamOrId) : streamOrId
    );

    const streamStates = new Map<string, { state?: unknown, revision: number }>();
    for (const stream of streams) {
      streamStates.set(stream.toString(), { revision: 0 });
    }

    if (streams.length > 0) {
      const snapshots = await this.config.snapshotStore.getLatest(streams);
      for (const snapshot of snapshots) {
        const streamKey = snapshot.stream.toString();
        const deserializedState = this.config.aggregateRegistry.deserialize(snapshot.stream, snapshot.data as string);
        streamStates.set(streamKey, {
          state: deserializedState,
          revision: snapshot.revision
        });
      }
    }

    const aggregates: AggregateRoot[] = [];
    const streamPointers: StreamPointer[] = [];

    for (const stream of streams) {
      const streamKey = stream.toString();
      const { state, revision } = streamStates.get(streamKey) || { revision: 0 };

      const aggregate = this.config.aggregateRegistry
        .instantiate(stream, revision, state);

      aggregates.push(aggregate);
      streamPointers.push({ stream, revision });
    }

    if (streamPointers.length > 0) {
      for await (const events of this.config.eventStore.readStreams(streamPointers)) {
        if (!events.length) continue;

        const eventsByStream = new Map<string, Event[]>();
        for (const event of events) {
          const streamKey = event.stream.toString();
          if (!eventsByStream.has(streamKey)) {
            eventsByStream.set(streamKey, []);
          }
          eventsByStream.get(streamKey)?.push(event);
        }

        for (let i = 0; i < aggregates.length; i++) {
          const streamKey = streams[i].toString();
          const streamEvents = eventsByStream.get(streamKey);
          if (streamEvents?.length) {
            aggregates[i].applyBatch(streamEvents);
          }
        }
      }
    }

    const missingAggregate = aggregates.find(aggregate => aggregate.revision === 0);
    if (missingAggregate) {
      throw new AggregateNotFoundError(missingAggregate.stream);
    }

    return aggregates as T[];
  }

  async save(aggregate: AggregateRoot): Promise<void> {
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

  #maybeStageSnapshot(aggregate: AggregateRoot, events: Event[]): void {
    // Serialize the aggregate state using the aggregate registry
    const serializedData = this.config.aggregateRegistry.serialize(aggregate.stream, aggregate.state);
    const snapshot: Snapshot = {
      stream: aggregate.stream,
      revision: aggregate.revision,
      ts: Date.now(),
      data: serializedData,
    };

    if (this.config.shouldSaveSnapshot(aggregate, events)) {
      this.config.unitOfWork.stageSnapshots([snapshot]);
    }
  }
}
