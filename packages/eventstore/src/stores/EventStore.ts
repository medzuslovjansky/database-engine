import type { EventEnvelope } from '../envelopes';
import type { EventRegistry, StreamPointer } from '../types';

export interface EventStore<R extends EventRegistry = EventRegistry> {
  readStream(pointer: StreamPointer): AsyncIterable<EventEnvelope<R>[]>;
  readStreams(pointers: StreamPointer[]): AsyncIterableIterator<EventEnvelope<R>[]>;
  readAll(fromId?: number): AsyncIterable<EventEnvelope<R>[]>;
}
