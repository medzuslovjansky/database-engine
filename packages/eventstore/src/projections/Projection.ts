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

  /** The ID of the last processed event */
  readonly lastEventId: number;

  /**
   * Reset the projection state
   */
  reset(): Promise<void>;

  /**
   * Handle an event
   * @param event The event to handle
   */
  handle(event: EventEnvelope<R>): Promise<void>;

  /**
   * Determine if an event should be handled by this projection
   * @param event The event to check
   * @returns True if the event should be handled by this projection, false otherwise
   */
  shouldHandle(event: EventEnvelope<R>): boolean;
}
