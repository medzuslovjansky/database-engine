import type { CommittedEvent } from '../envelopes';
import type { StreamPointer } from '../types';

export interface EventStore {
  readStream(pointer: StreamPointer): AsyncIterable<CommittedEvent[]>;
  readStreams(pointers: StreamPointer[]): AsyncIterableIterator<CommittedEvent[]>;
  readAll(fromId?: number): AsyncIterable<CommittedEvent[]>;
}
