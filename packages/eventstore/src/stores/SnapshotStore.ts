import type { StreamIdentifier } from '../primitives';
import type { SnapshotEnvelope } from '../envelopes';
import type { AggregateState, StreamPointer } from '../types';

export interface SnapshotStore {
  getBatch<S extends AggregateState = AggregateState>(pointers: StreamPointer[]): Promise<SnapshotEnvelope<S>[]>;
  getLatest<S extends AggregateState = AggregateState>(streams: StreamIdentifier[]): Promise<SnapshotEnvelope<S>[]>;
}
