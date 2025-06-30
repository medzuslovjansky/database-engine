import type { EventStore, ProjectionStore } from '../stores';
import type { Logger } from '../types';
import { ProjectionNotFoundError, NoProjectionsFoundError } from '../errors';

import type { ProjectionRegistry } from './ProjectionRegistry';
import { ProjectionProcessor, type ProjectionProcessorConfig } from './ProjectionProcessor';
import type { ProjectionLoggerFacade } from './ProjectionLoggerFacade';
import { DefaultProjectionLoggerFacade } from './ProjectionLoggerFacade';

/**
 * Options for configuring the ProjectionRunner.
 */
export interface ProjectionRunnerOptions {
  readonly eventStore: EventStore;
  readonly projectionRegistry: ProjectionRegistry;
  readonly projectionStore: ProjectionStore;
  readonly logger: Logger;
}

/**
 * Runs projections against an event store.
 */
export class ProjectionRunner {
  readonly #config: ProjectionRunnerOptions;
  readonly #logger: ProjectionLoggerFacade;
  readonly #runnerName = 'ProjectionRunner'; // Added for context in logging

  constructor(options: ProjectionRunnerOptions) {
    this.#config = options;
    this.#logger = new DefaultProjectionLoggerFacade(this.#config.logger, this.#runnerName);
  }

  protected get logger(): Logger {
    return this.#config.logger;
  }

  async run(): Promise<void> {
    const projections = this.#config.projectionRegistry.getAll();
    if (projections.length === 0) {
      this.#logger.noProjectionsFoundToRun(this.#runnerName);
      throw new NoProjectionsFoundError('run');
    }

    const names = projections.map(p => p.name);
    const initialPositions = await this.#config.projectionStore.getPositions(names);

    const processors = projections.map(projection => {
      const processorConfig: ProjectionProcessorConfig = {
        projection: projection,
        initialPosition: initialPositions[projection.name] ?? 0,
        loggerFacade: this.#logger,
      };

      return new ProjectionProcessor(processorConfig);
    });

    const minPosition = Math.min(...processors.map(p => p.currentLastProcessedEventId), 0);

    let eventCount = 0;
    for await (const eventBatch of this.#config.eventStore.readAll(minPosition)) {
      if (eventBatch.length === 0) break;

      await Promise.all(processors.map(processor => processor.processEvents(eventBatch)));

      eventCount += eventBatch.length;

      for (let i = processors.length - 1; i >= 0; i--) {
        if (processors[i].hasFailed) {
          processors.splice(i, 1);
        }
      }

      if (processors.length === 0) {
        this.#logger.allProcessorsNowFailed(this.#runnerName);
        break;
      }
    }

    this.#logger.projectionRunCompleted(this.#runnerName, eventCount, processors.length);
    for (const p of processors) {
      this.#logger.processorStatusSummary(this.#runnerName, p.name, p.currentLastProcessedEventId, p.hasFailed);
    }
  }

  async resetAll(): Promise<void> {
    const projections = this.#config.projectionRegistry.getAll();
    if (projections.length === 0) {
      this.#logger.noProjectionsFoundToReset(this.#runnerName);
      throw new NoProjectionsFoundError('reset');
    }
    await Promise.all(projections.map(projection => projection.reset()));
  }

  async resetProjection(name: string): Promise<void> {
    const projection = this.#config.projectionRegistry.get(name);
    if (projection) {
      await projection.reset();
    } else {
      this.#logger.projectionNotFoundForReset(this.#runnerName, name);
      throw new ProjectionNotFoundError(name);
    }
  }
}
