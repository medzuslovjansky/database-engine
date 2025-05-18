import type { Event } from '../envelopes';

/**
 * Interface for projections that handle a specific union of event types.
 * @template E - The specific Event union this projection handles (e.g., CounterEvent | UserEvent).
 */
export interface Projection<E extends Event = Event> {
  /**
   * The unique name of the projection, used for registration and retrieval.
   */
  readonly name: string;

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
   * Handle a specific event relevant to this projection.
   * This method is called only if `shouldHandle` returns true for the event.
   * @param event The event to handle (type-narrowed to E).
   */
  handle(event: E): void;
}
