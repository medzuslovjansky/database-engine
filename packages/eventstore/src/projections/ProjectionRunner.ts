import type { EventStore, ProjectionStore } from '../stores';
import type { EventRegistry, ProjectionMapping, Logger } from '../types';

import type { Projection } from './Projection';
import type { ProjectionRegistry } from './ProjectionRegistry';
import { ProjectionProcessor } from './ProjectionProcessor';

/**
 * Options for configuring the ProjectionRunner
 * @template M ProjectionMapping type that maps projection names to event types
 * @template R EventRegistry type containing all events
 */
export interface ProjectionRunnerOptions<
  M extends ProjectionMapping<R> = ProjectionMapping<EventRegistry>,
  R extends EventRegistry = EventRegistry
> {
  readonly projectionRegistry: ProjectionRegistry<M, R>;
  readonly eventStore: EventStore<R>;
  readonly projectionStore: ProjectionStore<M, R>;
  readonly logger?: Logger;
}

/**
 * Runs projections against an event store
 * @template M ProjectionMapping type that maps projection names to event types
 * @template R EventRegistry type containing all events
 */
export class ProjectionRunner<
  M extends ProjectionMapping<R> = ProjectionMapping<EventRegistry>,
  R extends EventRegistry = EventRegistry
> {
  readonly #config: ProjectionRunnerOptions<M, R>;

  constructor(options: ProjectionRunnerOptions<M, R>) {
    this.#config = options;
  }

  /**
   * Run all projections against the event store
   */
  async run(): Promise<void> {
    const projections = this.#config.projectionRegistry.getAll();
    const names = projections.map(p => p.name);
    const positions = await this.#config.projectionStore.getPositions(names);

    // Create projection processors that will run in parallel
    const processors = projections.map(projection => {
      const name = projection.name;
      return new ProjectionProcessor<keyof M, M, R>({
        projection: projection as Projection<M, keyof M, R>,
        initialPosition: positions[name] || 0,
        logger: this.#config.logger
      });
    });

    // Find the minimum position to start from
    const minPosition = Math.min(...Object.values(positions), 0);

    // Read all events from the minimum position
    for await (const batch of this.#config.eventStore.readAll(minPosition)) {
      // Process events in order but projections in parallel
      await Promise.all(
        processors.map(async processor => {
          for (const event of batch) {
            if (processor.shouldProcessEvent(event)) {
              await processor.processEvent(event);
            }
          }
        })
      );
    }

    // Persist final positions
    const finalPositions = this.#collectPositions(processors);
    await this.#config.projectionStore.updatePositions(finalPositions);
  }

  /**
   * Collect current positions from all processors
   * @param processors The projection processors to collect positions from
   * @returns A record of projection names to positions
   */
  #collectPositions(processors: Array<ProjectionProcessor<keyof M, M, R>>): Record<keyof M, number> {
    const positions: Partial<Record<keyof M, number>> = {};
    for (const processor of processors) {
      positions[processor.name] = processor.lastProcessedId;
    }
    return positions as Record<keyof M, number>;
  }

  /**
   * Reset all projections
   */
  async resetAll(): Promise<void> {
    const projections = this.#config.projectionRegistry.getAll();

    // Reset all projections in parallel
    await Promise.all(projections.map(async (projection) => {
      await projection.reset();
    }));

    // Reset all positions in the store
    const names = projections.map(p => p.name) as Array<string & keyof M>;
    await this.#config.projectionStore.resetPositions(names);
  }

  /**
   * Reset a specific projection
   * @param name The name of the projection to reset
   */
  async resetProjection(name: string & keyof M): Promise<void> {
    const projection = this.#config.projectionRegistry.get(name);
    await projection.reset();
    await this.#config.projectionStore.resetPositions([name]);
  }
}
