import type { EventRegistry, ProjectionMapping } from '../types';

/**
 * Store for retrieving projection position checkpoints.
 * Projections themselves are responsible for updating and resetting their positions
 * atomically with their data operations.
 * @template M ProjectionMapping type that maps projection names to event types
 * @template R EventRegistry type containing all events
 */
export interface ProjectionStore<
  M extends ProjectionMapping<R> = ProjectionMapping<EventRegistry>,
  R extends EventRegistry = EventRegistry
> {
  /**
   * Get the current positions for a set of projections.
   * These positions represent the ID of the last event successfully processed
   * by each projection in a previous run.
   * @param projections Array of projection names
   * @returns Record of projection names to positions (event IDs)
   */
  getPositions<K extends keyof M>(projections: K[]): Promise<Record<K, number>>;
}
