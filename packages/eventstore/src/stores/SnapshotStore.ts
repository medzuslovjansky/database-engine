import type { StreamIdentifier } from '../primitives';
import type { Snapshot } from '../envelopes';
import type { StreamPointer } from '../types';

export interface SnapshotStore {
  getBatch<S>(pointers: StreamPointer[]): Promise<Snapshot<S>[]>;
  getLatest<S>(streams: StreamIdentifier[]): Promise<Snapshot<S>[]>;
}
