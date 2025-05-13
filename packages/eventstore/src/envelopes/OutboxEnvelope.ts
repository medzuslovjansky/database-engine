import type { OutboxRegistry } from '../types';

export interface OutboxEnvelope<R extends OutboxRegistry = OutboxRegistry, K extends keyof R = keyof R> {
  id?: number;
  type: K;
  payload: R[K];
  status: number;
  createdAt: number;
  updatedAt: number;
}
