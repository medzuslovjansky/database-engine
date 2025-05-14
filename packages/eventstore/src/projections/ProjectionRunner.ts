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
 * Runs projections against an event store.
 * It orchestrates fetching events, feeding them to ProjectionProcessors,
 * and managing the persistence of projection positions.
 * @template M ProjectionMapping type that maps projection names to event types
 * @template R EventRegistry type containing all events
 */
export class ProjectionRunner<
  M extends ProjectionMapping<R> = ProjectionMapping<EventRegistry>,
  R extends EventRegistry = EventRegistry
> {
  readonly #config: ProjectionRunnerOptions<M, R>;
  readonly #logger: Logger;

  constructor(options: ProjectionRunnerOptions<M, R>) {
    this.#config = options;
    this.#logger = options.logger || {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };
  }

  /**
   * Run all registered projections against the event store.
   * This involves:
   * 1. Fetching current positions for all projections.
   * 2. Creating a ProjectionProcessor for each projection, initialized with its position.
   * 3. Reading events from the event store starting from the oldest position required.
   * 4. Feeding events to each processor.
   * 5. Performing a final flush on all processors.
   * 6. Updating projection positions in the projection store.
   */
  async run(): Promise<void> {
    const projections = this.#config.projectionRegistry.getAll();
    if (projections.length === 0) {
      return;
    }

    const names = projections.map(p => p.name);
    const initialPositions = await this.#config.projectionStore.getPositions(names);

    const processors = projections.map(projection => {
      const name = projection.name;
      const initialPosition = initialPositions[name] === undefined ? 0 : initialPositions[name];
      return new ProjectionProcessor<keyof M, M, R>({
        projection: projection as Projection<M, keyof M, R>,
        initialPosition: initialPosition!,
        logger: this.#logger,
      });
    });

    const minPosition = Math.min(...processors.map(p => p.currentLastProcessedEventId), 0);

    let eventCount = 0;
    for await (const eventBatch of this.#config.eventStore.readAll(minPosition)) {
      if (eventBatch.length === 0) continue;
      eventCount += eventBatch.length;

      for (const event of eventBatch) {
        // Feed each event to all processors. Each processor will decide if it should handle it.
        await Promise.all(processors.map(processor => processor.processEvent(event)));
      }
    }

    await Promise.all(processors.map(processor => processor.finalFlush()));
  }

  /**
   * Reset all projections.
   * This involves resetting the internal state of each projection and their
   * persisted positions in the ProjectionStore.
   */
  async resetAll(): Promise<void> {
    const projections = this.#config.projectionRegistry.getAll();
    if (projections.length === 0) {
      return;
    }

    await Promise.all(projections.map(projection => projection.reset()));
  }

  /**
   * Reset a specific projection by name.
   * @param name The name of the projection to reset.
   */
  async resetProjection(name: string & keyof M): Promise<void> {
    const projection = this.#config.projectionRegistry.get(name);
    // Projection is responsible for resetting its own persisted state.
    await projection.reset();
  }
}
