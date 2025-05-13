import type { EventEnvelope } from '../envelopes';
import type { EventRegistry, ProjectionMapping, Logger } from '../types';

import type { Projection } from './Projection';

/**
 * Configuration for ProjectionProcessor
 */
export interface ProjectionProcessorConfig<
  N extends keyof M,
  M extends ProjectionMapping<R>,
  R extends EventRegistry = EventRegistry
> {
  projection: Projection<M, N, R>;
  initialPosition: number;
  logger?: Logger;
}

/**
 * Handles processing events for a single projection
 * @template M ProjectionMapping type that maps projection names to event types
 * @template R EventRegistry containing all events
 */
export class ProjectionProcessor<
  N extends keyof M,
  M extends ProjectionMapping<R>,
  R extends EventRegistry = EventRegistry
> {
  #projection: Projection<M, N, R>;
  #lastProcessedId: number;
  #pendingEvents: EventEnvelope<R>[] = [];
  #processing = false;
  #failed = false;
  #logger: Logger;

  /**
   * Create a new projection processor
   * @param config Configuration for the processor
   */
  constructor(config: ProjectionProcessorConfig<N, M, R>) {
    this.#projection = config.projection;
    this.#lastProcessedId = config.projection.lastEventId || config.initialPosition;
    this.#logger = config.logger || {
      log: console.log,
      warn: console.warn,
      error: console.error
    };
  }

  /**
   * Check if an event should be processed by this projection
   * @param event The event to check
   * @returns True if the event should be processed, false otherwise
   */
  shouldProcessEvent(event: EventEnvelope<R>): boolean {
    if (this.#failed) return false;
    if (event.id === undefined) return false;
    if (this.#lastProcessedId >= event.id) return false;
    if (!this.#projection.shouldHandle(event)) return false;
    return true;
  }

  /**
   * Process an event for this projection
   * @param event The event to process
   */
  async processEvent(event: EventEnvelope<R>): Promise<void> {
    // Add event to this projection's queue
    this.#pendingEvents.push(event);

    // If already processing events, return (the processor will get to this event)
    if (this.#processing) {
      return;
    }

    // Process all pending events in order
    this.#processing = true;
    try {
      while (this.#pendingEvents.length > 0) {
        const nextEvent = this.#pendingEvents.shift()!;

        try {
          // We've verified this event is relevant in #isEventRelevant
          await this.#projection.handle(nextEvent as EventEnvelope<R, M[N]>);

          // Update position if event has an ID
          if (nextEvent.id !== undefined) {
            this.#lastProcessedId = nextEvent.id;
          }
        } catch (error) {
          this.#failed = true;
          this.#logger.error(
            `Error processing event ${nextEvent.id} in projection ${String(this.#projection.name)}. Switching to noop mode:`,
            error
          );
          // Clear pending events since we're in noop mode now
          this.#pendingEvents = [];
          break;
        }
      }
    } finally {
      this.#processing = false;
    }
  }

  /**
   * Get projection name
   */
  get name(): N {
    return this.#projection.name;
  }

  /**
   * Get the last processed event ID
   */
  get lastProcessedId(): number {
    return this.#lastProcessedId;
  }

  get failed(): boolean {
    return this.#failed;
  }

  /**
   * Get the underlying projection
   */
  get projection(): Projection<M, N, R> {
    return this.#projection;
  }
}
