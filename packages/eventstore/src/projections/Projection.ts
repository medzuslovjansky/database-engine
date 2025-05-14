import type {EventEnvelope} from '../envelopes';
import type {ProjectionMapping, EventRegistry} from '../types';

/**
 * Interface for projections that handle events
 * @template N Name of the projection (must be a key in M)
 * @template M ProjectionMapping that defines which event types each projection handles
 * @template R EventRegistry containing all event types
 */
export interface Projection<
  M extends ProjectionMapping<R>,
  N extends keyof M,
  R extends EventRegistry = EventRegistry
> {
  /** The name of the projection */
  readonly name: N;

  /**
   * Reset the projection state.
   * This involves clearing any internal, un-flushed state AND resetting
   * the projection's persisted position to its baseline (e.g., 0).
   * This operation should be atomic if possible.
   */
  reset(): Promise<void>;

  /**
   * Let the projection tell if it should be flushed.
   * This could be based on the number of events handled, time elapsed,
   * or other projection-specific logic.
   */
  shouldFlush(): boolean;

  /**
   * Flush the projection state.
   * This method is responsible for persisting any changes accumulated
   * by `handle()` calls, AND for atomically persisting the new projection position
   * (i.e., the ID of the last event successfully included in this flush).
   * @returns A Promise that resolves with the event ID of the last event
   * successfully included and persisted in this flush operation.
   * @throws An error if the flush operation (including position update) fails.
   * The projection is responsible for ensuring its internal state and persisted
   * position remain consistent (e.g., rolled back) upon failure.
   */
  flush(): Promise<number>;

  /**
   * Determine if an event should be handled by this projection
   * @param event The event to check
   * @returns True if the event should be handled by this projection, false otherwise
   */
  shouldHandle(event: EventEnvelope<R>): boolean;

  /**
   * Handle an event
   * @param event The event to handle
   */
  handle(event: EventEnvelope<R>): void;
}
