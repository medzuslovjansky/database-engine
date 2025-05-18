import type { Event } from '../envelopes';
import { DuplicateProjectionRegistrationError } from '../errors';

import type { Projection } from './Projection';

/**
 * Registry for projections. Projections are stored by their unique string name.
 */
export class ProjectionRegistry {
  #projections = new Map<string, Projection>();

  /**
   * Register a projection with the registry.
   * @param projection The projection instance to register. Its `name` property will be used as the key.
   */
  register(projection: Projection): void {
    const name = projection.name;
    if (this.#projections.has(name)) {
      throw new DuplicateProjectionRegistrationError(name);
    }
    this.#projections.set(name, projection);
  }

  /**
   * Get a projection by its unique name.
   * @param name The name of the projection to retrieve.
   * @returns The projection instance if found, otherwise undefined.
   * The caller should use the `shouldHandle` method on the projection to safely process events.
   */
  get<E extends Event>(name: string): Projection<E> | undefined {
    return this.#projections.get(name) as Projection<E> | undefined;
  }

  /**
   * Get all registered projections.
   * @returns An array of all projection instances.
   */
  getAll<E extends Event>(): Array<Projection<E>> {
    return [...this.#projections.values()] as Array<Projection<E>>;
  }
}
