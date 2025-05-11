import type { EventEnvelope } from './EventEnvelope';

export interface EventStore {
  /** append MUST be atomic, idempotent, and assign global id  */
  append(events: EventEnvelope[]): Promise<void>;

  /** read a single stream forward; empty stream yields []. */
  readStream(stream: string, fromId?: number): AsyncIterable<EventEnvelope>;

  /** read everything in global order (id ASC) */
  readAll(fromId?: number): AsyncIterable<EventEnvelope>;
}
