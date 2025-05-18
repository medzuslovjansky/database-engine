import type { StreamIdentifier } from '../primitives';

export interface Snapshot<S = unknown> {
  stream: StreamIdentifier;
  revision: number;
  ts: number;
  data: S;
}