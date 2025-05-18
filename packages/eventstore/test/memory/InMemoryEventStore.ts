import type { EventStore } from '../../src/stores';
import type { CommittedEvent, Event } from '../../src/envelopes';
import type { StreamPointer } from '../../src/types';
import { StreamIdentifier } from '../../src/primitives';

import { InMemoryStore } from './InMemoryStore';

export class InMemoryEventStore
  extends InMemoryStore<CommittedEvent> implements EventStore {
  #nextId = 1;

  constructor(items: CommittedEvent[] = []) {
    super({ items });

    if (items.length > 0) {
      const maxId = Math.max(...items.map(e => e.id ?? 0));
      this.#nextId = maxId + 1;
    }
  }

  override add(events: Event[]): void {
    for (const event of events) {
      if (event.id === undefined) {
        event.id = this.#nextId++;
      }
    }

    super.add(events as CommittedEvent[]);
    this.items.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }

  async *readStream(pointer: StreamPointer): AsyncIterable<CommittedEvent[]> {
    const stream = typeof pointer.stream === 'string'
      ? StreamIdentifier.fromString(pointer.stream)
      : pointer.stream;
    const streamStr = stream.toString();
    const fromRevision = pointer.revision ?? 0;

    const filtered = this.items
      .filter(e => e.stream.toString() === streamStr && e.revision > fromRevision);

    if (filtered.length > 0) {
      yield filtered;
    }
  }

  async *readStreams(pointers: StreamPointer[]): AsyncIterableIterator<CommittedEvent[]> {
    for (const pointer of pointers) {
      yield* this.readStream(pointer);
    }
  }

  async *readAll(fromId = 0): AsyncIterable<CommittedEvent[]> {
    const filtered = this.items.filter(e => (e.id ?? 0) > fromId);

    if (filtered.length > 0) {
      yield filtered;
    }
  }

  get eventCount(): number {
    return this.count;
  }

  get allEvents(): CommittedEvent[] {
    return this.all;
  }

  clear(): void {
    super.clear();
    this.#nextId = 1;
  }

  resetNextId(newId = 1): void {
    this.#nextId = newId;
  }
}
