import type { CommittedEvent } from '../envelopes';
import { ProjectionProcessingError, ProjectionFlushError } from '../errors';

import type { Projection } from './Projection';
import type { ProjectionLoggerFacade } from './ProjectionLoggerFacade';

/**
 * Configuration for ProjectionProcessor
 */
export interface ProjectionProcessorConfig {
  projection: Projection;
  initialPosition: number;
  loggerFacade: ProjectionLoggerFacade; // Changed from logger: Logger
}

/**
 * Handles processing events for a single projection using a state machine.
 * States: CATCHING_UP -> PROCESSING -> FAILED
 */
export class ProjectionProcessor {
  readonly #projection: Projection;
  readonly #loggerFacade: ProjectionLoggerFacade;

  #currentLastProcessedEventId: number;
  #eventsPendingFlush: CommittedEvent[] = [];
  #hasFailed = false; // Public getter, private setter through #transitionToFailed
  #failureError?: Error; // Store the error that caused the failure

  // Dynamically assigned method for current state's event processing logic
  public processEvents: (events: CommittedEvent[]) => Promise<void>;

  constructor(config: ProjectionProcessorConfig) {
    this.#currentLastProcessedEventId = config.initialPosition;
    this.#loggerFacade = config.loggerFacade; // Changed
    this.#projection = config.projection;

    // Initial state
    this.processEvents = this.#processEventsCatchingUp;
    this.#loggerFacade.initialized(
      this.name,
      this.#currentLastProcessedEventId,
      'CATCHING_UP'
    );
  }

  get name(): string {
    return this.#projection.name;
  }

  get currentLastProcessedEventId(): number {
    return this.#currentLastProcessedEventId;
  }

  get hasFailed(): boolean {
    return this.#hasFailed;
  }

  get failureError(): Error | undefined {
    return this.#failureError;
  }

  #transitionToFailed(error?: Error): void {
    if (this.#hasFailed) return; // Already failed, no need to log/clear again

    this.#loggerFacade.transitionedToFailed(this.name);
    this.#hasFailed = true;
    this.#failureError = error;
    this.#eventsPendingFlush = []; // Clear pending events
    this.processEvents = this.#processEventsFailed; // Set to no-op processor
  }

  async #processEventsCatchingUp(events: CommittedEvent[]): Promise<void> {
    if (this.#hasFailed || events.length === 0) {
      return;
    }

    let firstRelevantEventIndex = -1;
    let firstRelevantEventId: number | undefined;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.id > this.#currentLastProcessedEventId) {
        const expectedEventId = this.#currentLastProcessedEventId + 1;
        if (event.id !== expectedEventId) {
          const error = new ProjectionProcessingError(
            this.name,
            event.id,
            `Catch-up gap detected: Expected event ID ${expectedEventId} after ${this.#currentLastProcessedEventId}, but received ${event.id}`
          );
          this.#loggerFacade.catchUpGapDetected(
            this.name,
            expectedEventId,
            this.#currentLastProcessedEventId,
            event.id
          );
          this.#transitionToFailed(error);
          throw error;
        }
        firstRelevantEventIndex = i;
        firstRelevantEventId = event.id;
        break;
      }
      // Event is old or current, skip it in CATCHING_UP phase
    }

    if (firstRelevantEventIndex !== -1) {
      this.#loggerFacade.catchUpComplete(
        this.name,
        this.#currentLastProcessedEventId,
        'PROCESSING',
        firstRelevantEventId
      );
      this.processEvents = this.#processEventsProcessing;
      const eventsToProcess = events.slice(firstRelevantEventIndex);
      if (eventsToProcess.length > 0) {
        // Directly call the new state's processing logic for the remaining events in this batch
        return this.#processEventsProcessing(eventsToProcess);
      }
    } else if (events.length > 0) {
      // All events in this batch were old or current, still catching up.
    }
    // If no relevant events found or batch was empty, just return.
    // No flush needed as CATCHING_UP doesn't add to #eventsPendingFlush.
  }

  async #processEventsProcessing(events: CommittedEvent[]): Promise<void> {
    if (this.#hasFailed || events.length === 0) {
      return;
    }

    const expectedInitialEventIdForBatch = this.#currentLastProcessedEventId + 1;

    if (events[0].id !== expectedInitialEventIdForBatch) {
      const error = new ProjectionProcessingError(
        this.name,
        events[0].id,
        `Batch out of order: Expected event ID ${expectedInitialEventIdForBatch} after ${this.#currentLastProcessedEventId}, but received ${events[0].id}`
      );
      this.#loggerFacade.processingBatchOutOfOrder(
        this.name,
        expectedInitialEventIdForBatch,
        this.#currentLastProcessedEventId,
        events[0].id
      );
      this.#transitionToFailed(error);
      throw error;
    }

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      // Validate event ID against the last flushed ID + events already pending in this cycle
      const expectedEventIdConsideringPending =
        (this.#eventsPendingFlush.length > 0
            ? this.#eventsPendingFlush[this.#eventsPendingFlush.length -1].id
            : this.#currentLastProcessedEventId)
        + 1;

      if (event.id !== expectedEventIdConsideringPending) {
        const error = new ProjectionProcessingError(
          this.name,
          event.id,
          `Event out of order: Expected event ID ${expectedEventIdConsideringPending}, but received ${event.id}`
        );
        this.#loggerFacade.processingEventOutOfOrder(
          this.name,
          event.id,
          expectedEventIdConsideringPending,
          this.#currentLastProcessedEventId,
          this.#eventsPendingFlush.map(e=>e.id)
        );
        this.#transitionToFailed(error);
        throw error;
      }

      try {
        this.#projection.handle(event);
        this.#eventsPendingFlush.push(event);

        if (this.#projection.shouldFlush()) {
          await this.#executeFlush();
          if (this.#hasFailed) {
            throw this.#failureError!;
          }
        }
      } catch (error) {
        const projectionError = new ProjectionProcessingError(
          this.name,
          event.id,
          error
        );
        this.#loggerFacade.failedToProcessEvent(
          this.name,
          event.id,
          String(event.type),
          error
        );
        this.#transitionToFailed(projectionError);
        throw projectionError;
      }
    }

    // After processing all events in the batch, if not failed and there are pending events, flush them.
    if (!this.#hasFailed && this.#eventsPendingFlush.length > 0) {
      await this.#executeFlush();
      if (this.#hasFailed) {
        throw this.#failureError!;
      }
    }
  }

  async #processEventsFailed(_events: CommittedEvent[]): Promise<void> {
    // No-op state. Failure already logged when transitioning.
    if (this.#failureError) {
      throw this.#failureError;
    }
    return Promise.resolve();
  }

  async #executeFlush(): Promise<void> {
    if (this.#hasFailed || this.#eventsPendingFlush.length === 0) {
      return;
    }

    const eventsToFlush = [...this.#eventsPendingFlush];

    try {
      const flushedToEventId = await this.#projection.flush();
      const lastEventIdInFlushedSet = eventsToFlush[eventsToFlush.length - 1].id!;

      if (flushedToEventId !== lastEventIdInFlushedSet) {
        const error = new ProjectionFlushError(
          this.name,
          lastEventIdInFlushedSet,
          new Error(`Flush mismatch: Projection reported flushing to event ID ${flushedToEventId}, but expected ${lastEventIdInFlushedSet}`)
        );
        this.#loggerFacade.flushMismatch(
          this.name,
          flushedToEventId,
          lastEventIdInFlushedSet
        );
        this.#transitionToFailed(error);
        throw error;
      } else {
        this.#currentLastProcessedEventId = flushedToEventId;
        const flushedCount = eventsToFlush.length;
        this.#eventsPendingFlush.splice(0, flushedCount);
        this.#loggerFacade.flushedSuccessfully(
          this.name,
          flushedCount,
          this.#currentLastProcessedEventId,
          this.#eventsPendingFlush.length
        );
      }
    } catch (error) {
      const lastEventIdInAttempt = eventsToFlush.length > 0 ? eventsToFlush[eventsToFlush.length - 1].id! : this.#currentLastProcessedEventId;
      const flushError = new ProjectionFlushError(
        this.name,
        lastEventIdInAttempt,
        error
      );
      this.#loggerFacade.failedToExecuteFlush(
        this.name,
        lastEventIdInAttempt,
        error
      );
      this.#transitionToFailed(flushError);
      throw flushError;
    }
  }
}
