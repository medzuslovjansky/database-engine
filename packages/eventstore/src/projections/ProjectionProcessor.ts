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
 * Handles processing events for a single projection, managing its lifecycle,
 * event sequencing, and flushing mechanics.
 * @template N Name of the projection
 * @template M ProjectionMapping type that maps projection names to event types
 * @template R EventRegistry containing all events
 */
export class ProjectionProcessor<
  N extends keyof M,
  M extends ProjectionMapping<R>,
  R extends EventRegistry = EventRegistry
> {
  readonly #projection: Projection<M, N, R>;
  readonly #logger: Logger;

  #currentLastProcessedEventId: number;
  #eventsPendingFlush: Array<EventEnvelope<R>> = [];
  #isFlushing = false;
  #hasFailed = false;

  constructor(config: ProjectionProcessorConfig<N, M, R>) {
    this.#projection = config.projection;
    this.#currentLastProcessedEventId = config.initialPosition;
    // Ensure projection name is stringified for the logger context
    const projectionNameStr = String(config.projection.name);
    this.#logger = config.logger || {
      log: (...args) => console.log(`[${projectionNameStr}]`, ...args),
      warn: (...args) => console.warn(`[${projectionNameStr}]`, ...args),
      error: (...args) => console.error(`[${projectionNameStr}]`, ...args),
    };
  }

  /**
   * Gets the name of the projection being processed.
   */
  get name(): N {
    return this.#projection.name;
  }

  /**
   * Gets the ID of the last event that was successfully processed and flushed.
   */
  get currentLastProcessedEventId(): number {
    return this.#currentLastProcessedEventId;
  }

  /**
   * Indicates whether the projection processor has encountered an unrecoverable error
   * during the current run and has stopped processing events.
   */
  get hasFailed(): boolean {
    return this.#hasFailed;
  }

  /**
   * Determines if an event should be preliminarily accepted for processing.
   * This checks if the processor has failed, if the event has an ID, if it's not too old,
   * and if the projection itself should handle this type of event.
   * @param event The event to check.
   * @returns True if the event might be processed, false otherwise.
   */
  private shouldAcceptEvent(event: EventEnvelope<R>): boolean {
    if (this.#hasFailed) {
      return false;
    }
    if (event.id === undefined) {
      this.#logger.warn(`Event ${String(event.type)} has no ID, skipping.`);
      return false;
    }
    // Event is older than or same as the last successfully flushed event ID
    if (event.id <= this.#currentLastProcessedEventId) {
      return false;
    }
    if (!this.#projection.shouldHandle(event)) {
      return false;
    }
    return true;
  }

  /**
   * Processes a single event.
   * This involves sequence validation, calling the projection's handle method,
   * and triggering a flush if the projection indicates it's ready.
   * @param event The event to process.
   */
  async processEvent(event: EventEnvelope<R>): Promise<void> {
    if (!this.shouldAcceptEvent(event)) {
      return;
    }

    // Strict "x+1" event ID sequence validation
    const expectedNextEventId =
      this.#eventsPendingFlush.length > 0
        ? this.#eventsPendingFlush[this.#eventsPendingFlush.length - 1].id! + 1
        : this.#currentLastProcessedEventId + 1;

    if (event.id! !== expectedNextEventId) {
      this.#logger.error(
        `Critical: Out-of-sequence event. Expected ID ${expectedNextEventId}, got ${event.id}. Halting projection.`
      );
      this.#hasFailed = true;
      this.#eventsPendingFlush = []; // Clear pending work as state is suspect
      return;
    }

    try {
      // The type assertion `as EventEnvelope<R, M[N]>` ensures that the projection's
      // handle method receives the event typed to the specific event types it expects.
      this.#projection.handle(event as EventEnvelope<R, M[N]>);
      this.#eventsPendingFlush.push(event);
    } catch (error) {
      this.#logger.error(
        `Error in .handle() for event ${event.id} (type: ${String(event.type)}):`,
        error
      );
      this.#hasFailed = true;
      this.#eventsPendingFlush = []; // Clear potentially corrupted pending work
      return;
    }

    if (this.#projection.shouldFlush()) {
      await this.#executeFlush();
    }
  }

  /**
   * Executes the flush operation for the accumulated events.
   * This calls the projection's flush method and updates the processor's state
   * based on the outcome.
   */
  async #executeFlush(): Promise<void> {
    if (this.#isFlushing || this.#hasFailed || this.#eventsPendingFlush.length === 0) {
      return;
    }

    this.#isFlushing = true;
    // Create a snapshot of events to attempt flushing for this specific operation.
    const eventsInThisFlushAttempt = [...this.#eventsPendingFlush];

    try {
      const flushedToEventId = await this.#projection.flush();
      const lastEventIdInAttempt = eventsInThisFlushAttempt[eventsInThisFlushAttempt.length - 1].id!;

      if (flushedToEventId !== lastEventIdInAttempt) {
        this.#logger.error(
          `Critical: Projection reported flushedEventId ${flushedToEventId}, but the last event in the flushed batch was ${lastEventIdInAttempt}. Halting due to inconsistent state.`
        );
        this.#hasFailed = true;
        this.#eventsPendingFlush = []; // Clear all pending events, state is untrustworthy.
      } else {
        this.#currentLastProcessedEventId = flushedToEventId;
        // Remove the successfully flushed events from the primary pending queue.
        // This ensures that if new events were added while awaiting flush, they are preserved.
        this.#eventsPendingFlush.splice(0, eventsInThisFlushAttempt.length);
        this.#logger.log(`Successfully flushed up to event ${flushedToEventId}. ${this.#eventsPendingFlush.length} events remain pending.`);
      }
    } catch (error) {
      const lastEventIdInAttempt = eventsInThisFlushAttempt[eventsInThisFlushAttempt.length - 1].id!;
      this.#logger.error(
        `Error in .flush() attempting to flush events up to ${lastEventIdInAttempt}:`,
        error
      );
      this.#hasFailed = true;
      // If flush fails, the projection is responsible for its internal rollback.
      // #currentLastProcessedEventId is NOT updated.
      // For this run, the processor is failed. Clear pending events for this processor's current run.
      this.#eventsPendingFlush = [];
    } finally {
      this.#isFlushing = false;
    }
  }

  /**
   * Performs a final flush attempt for any pending events if the processor
   * has not failed and is not already flushing.
   * This is typically called at the end of an event processing cycle.
   */
  async finalFlush(): Promise<void> {
    if (this.#eventsPendingFlush.length > 0 && !this.#hasFailed && !this.#isFlushing) {
      this.#logger.log(`Performing final flush of ${this.#eventsPendingFlush.length} pending events.`);
      await this.#executeFlush();
    }
  }
}
