import type { StreamIdentifier } from '../primitives';
import type { EventRegistry } from '../types';

export interface EventEnvelope<R extends EventRegistry = EventRegistry, K extends keyof R = keyof R> {
  id?: number;
  stream: StreamIdentifier;
  revision: number;
  type: K;
  ts: number;
  data: R[K];
}
