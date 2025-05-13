import type { Projection } from './Projection';
import type { EventRegistry, ProjectionMapping } from '../types';

/**
 * Registry for projections that provides type-safe access by projection name
 * @template M ProjectionMapping type that maps projection names to event types
 * @template R EventRegistry type containing all events
 */
export class ProjectionRegistry<
  M extends ProjectionMapping<R> = ProjectionMapping<EventRegistry>,
  R extends EventRegistry = EventRegistry
> {
  // Since we've defined M as ProjectionMapping<string, R>, all its keys are strings
  #projections = new Map<keyof M, Projection<M, keyof M, R>>();

  /**
   * Register a projection with the registry
   * @param projection The projection to register
   */
  register(projection: Projection<M, keyof M, R>): void {
    const name = projection.name;
    if (this.#projections.has(name)) {
      throw new Error(`Duplicate projection registration: ${String(name)}`);
    }
    this.#projections.set(name, projection);
  }

  /**
   * Get a projection by name
   * @param name The name of the projection to get
   * @returns The projection
   */
  get<N extends keyof M>(name: N): Projection<M, N, R> {
    const projection = this.#projections.get(name) as Projection<M, N, R>;
    if (!projection) {
      throw new Error(`Unknown projection: ${String(name)}`);
    }
    return projection;
  }

  /**
   * Get all registered projections
   * @returns Array of all projections
   */
  getAll(): Array<Projection<M, keyof M, R>> {
    return [...this.#projections.values()];
  }
}
