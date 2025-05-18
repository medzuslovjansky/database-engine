import type { StreamIdentifier } from '../primitives';

/**
 * Represents an event in the system.
 * @template T - The type of the event (string literal).
 * @template D - The data payload of the event.
 */
export interface Event<T extends string = string, D = unknown> {
  /**
   * Unique identifier of the event, usually assigned by the event store.
   * Optional until the event is persisted.
   */
  id?: number;

  /**
   * Identifier of the stream this event belongs to.
   */
  stream: StreamIdentifier;

  /**
   * Revision number of this event within its stream.
   */
  revision: number;

  /**
   * The type of the event.
   */
  type: T;

  /**
   * Timestamp of when the event occurred or was recorded.
   */
  ts: number;

  /**
   * The data payload specific to this event type.
   */
  data: D;
}

export interface CommittedEvent<T extends string = string, D = unknown> extends Event<T, D> {
  id: number;
}
