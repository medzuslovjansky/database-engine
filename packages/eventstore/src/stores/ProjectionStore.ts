import type { EventRegistry, ProjectionMapping } from '../types';

/**
 * Store for projection position checkpoints
 * @template M ProjectionMapping type that maps projection names to event types
 * @template R EventRegistry type containing all events
 */
export interface ProjectionStore<
  M extends ProjectionMapping<R> = ProjectionMapping<EventRegistry>,
  R extends EventRegistry = EventRegistry
> {
  /**
   * Get the current positions for a set of projections
   * @param projections Array of projection names
   * @returns Record of projection names to positions
   */
  getPositions<K extends keyof M>(projections: K[]): Promise<Record<K, number>>;

  /**
   * Reset positions for a set of projections
   * @param projections Array of projection names
   */
  resetPositions<K extends keyof M>(projections: K[]): Promise<void>;

  /**
   * Update positions for a set of projections
   * @param positions Record of projection names to positions
   */
  updatePositions<K extends keyof M>(positions: Record<K, number>): void;
}
