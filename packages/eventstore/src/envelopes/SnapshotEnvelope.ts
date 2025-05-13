import type { StreamIdentifier } from '../primitives';
import type { AggregateState } from '../types';

export interface SnapshotEnvelope<S extends AggregateState = AggregateState> {
  stream: StreamIdentifier;
  revision: number;
  ts: number;
  data: S;
}
