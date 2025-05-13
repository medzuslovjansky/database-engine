import type { OutboxEnvelope } from '../envelopes';
import type { OutboxRegistry } from '../types';

export interface OutboxStore<R extends OutboxRegistry = OutboxRegistry> {
  getPending(limit: number): Promise<OutboxEnvelope<R>[]>;
  getPendingOfType<K extends keyof R>(type: K, limit: number): Promise<OutboxEnvelope<R>[]>;
  remove(ids: number[]): Promise<void>;
  push(messages: OutboxEnvelope<R>[]): Promise<void>;
}
