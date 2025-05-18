import type { Logger } from "../types";

/**
 * Facade for logging specific events occurring within the ProjectionProcessor.
 * An implementation of this interface will be provided externally.
 */
export interface ProjectionLoggerFacade {
  // ProjectionProcessor
  initialized(projectionName: string, initialPosition: number, initialState: string): void;
  transitionedToFailed(projectionName: string): void;
  catchUpGapDetected(projectionName: string, expectedEventId: number, lastProcessedEventId: number, receivedEventId: number): void;
  catchUpComplete(projectionName: string, lastProcessedEventId: number, nextState: string, startingEventId: number | undefined): void;
  processingBatchOutOfOrder(projectionName: string, expectedEventId: number, lastFlushedId: number, receivedEventId: number): void;
  processingEventOutOfOrder(projectionName: string, receivedEventId: number, expectedEventId: number, lastFlushedId: number, pendingEventIds: number[]): void;
  failedToProcessEvent(projectionName: string, eventId: number, eventType: string, error: unknown): void;
  flushMismatch(projectionName: string, reportedFlushedToId: number, expectedFlushedToId: number): void;
  flushedSuccessfully(projectionName: string, flushedCount: number, newLastProcessedEventId: number, pendingCount: number): void;
  failedToExecuteFlush(projectionName: string, attemptedUpToEventId: number, error: unknown): void;

  // ProjectionRunner
  noProjectionsFoundToRun(runnerName: string): void;
  allProcessorsFailedOrCompleted(runnerName: string): void;
  allProcessorsNowFailed(runnerName: string): void;
  projectionRunCompleted(runnerName: string, eventCount: number, processorCount: number): void;
  processorStatusSummary(runnerName: string, processorName: string, lastProcessedEventId: number, hasFailed: boolean): void;
  noProjectionsFoundToReset(runnerName: string): void;
  projectionNotFoundForReset(runnerName: string, projectionName: string): void;
}

// Adapter to make Logger compatible with ProjectionLoggerFacade
export class DefaultProjectionLoggerFacade implements ProjectionLoggerFacade {
  readonly #logger: Logger;

  constructor(logger: Logger, projectionName: string) {
    this.#logger = logger.child?.({ projection: projectionName }) ?? logger;
  }

  initialized(projectionName: string, initialPosition: number, initialState: string): void {
    this.#logger.warn(`Projection [${projectionName}] initialized. Last processed ID: ${initialPosition}. Starting in ${initialState} state.`);
  }
  transitionedToFailed(projectionName: string): void {
    this.#logger.error(`Projection [${projectionName}] has failed. Transitioning to FAILED state.`);
  }
  catchUpGapDetected(projectionName: string, expectedEventId: number, lastProcessedEventId: number, receivedEventId: number): void {
    this.#logger.error(`Projection [${projectionName}] CATCH_UP Error: Expected event ID ${expectedEventId} (after ${lastProcessedEventId}), but received ${receivedEventId}. Gap detected.`);
  }
  catchUpComplete(projectionName: string, lastProcessedEventId: number, nextState: string, startingEventId: number | undefined): void {
    this.#logger.warn(`Projection [${projectionName}] Catch-up complete. Last processed ID: ${lastProcessedEventId}. Transitioning to ${nextState} state${startingEventId !== undefined ? ` starting with event ID ${startingEventId}` : ''}.`);
  }
  processingBatchOutOfOrder(projectionName: string, expectedEventId: number, lastFlushedId: number, receivedEventId: number): void {
    this.#logger.error(`Projection [${projectionName}] PROCESSING Error: Event batch out of order. Expected event ID ${expectedEventId} (after last flushed ${lastFlushedId}), received ${receivedEventId}.`);
  }
  processingEventOutOfOrder(projectionName: string, receivedEventId: number, expectedEventId: number, lastFlushedId: number, pendingEventIds: number[]): void {
    this.#logger.error(`Projection [${projectionName}] PROCESSING Error: Event ID ${receivedEventId} is not expected next ID ${expectedEventId}. Last flushed: ${lastFlushedId}. Pending: ${pendingEventIds.join(',') || 'none'}.`);
  }
  failedToProcessEvent(projectionName: string, eventId: number, eventType: string, error: unknown): void {
    this.#logger.error(`Projection [${projectionName}] failed to process event ${eventId} (type: ${eventType}):`, error);
  }
  flushMismatch(projectionName: string, reportedFlushedToId: number, expectedFlushedToId: number): void {
    this.#logger.error(`Projection [${projectionName}] FLUSH Error: Mismatch in flushed IDs. Projection reported ${reportedFlushedToId}, expected ${expectedFlushedToId}.`);
  }
  flushedSuccessfully(projectionName: string, flushedCount: number, newLastProcessedEventId: number, pendingCount: number): void {
    this.#logger.warn(`Projection [${projectionName}] flushed ${flushedCount} events. New last processed ID: ${newLastProcessedEventId}. Pending: ${pendingCount}.`);
  }
  failedToExecuteFlush(projectionName: string, attemptedUpToEventId: number, error: unknown): void {
    this.#logger.error(`Projection [${projectionName}] failed to execute flush (attempted up to event ID ${attemptedUpToEventId}):`, error);
  }

  // New methods for ProjectionRunner
  noProjectionsFoundToRun(runnerName: string): void {
    this.#logger.error(`Runner [${runnerName}]: No projections found to run.`);
  }
  allProcessorsFailedOrCompleted(runnerName: string): void {
    this.#logger.warn(`Runner [${runnerName}]: All projection processors have failed or completed. Stopping event processing.`);
  }
  allProcessorsNowFailed(runnerName: string): void {
    this.#logger.warn(`Runner [${runnerName}]: All projection processors have now failed. Stopping event processing.`);
  }
  projectionRunCompleted(runnerName: string, eventCount: number, processorCount: number): void {
    this.#logger.warn(`Runner [${runnerName}]: Projection run completed. Processed ${eventCount} events across ${processorCount} initial processors.`);
  }
  processorStatusSummary(runnerName: string, processorName: string, lastProcessedEventId: number, hasFailed: boolean): void {
    this.#logger.warn(`Runner [${runnerName}] Processor ${processorName}: Last processed ID ${lastProcessedEventId}, Failed: ${hasFailed}`);
  }
  noProjectionsFoundToReset(runnerName: string): void {
    this.#logger.error(`Runner [${runnerName}]: No projections found to reset.`);
  }
  projectionNotFoundForReset(runnerName: string, projectionName: string): void {
    this.#logger.error(`Runner [${runnerName}]: Projection with name "${projectionName}" not found for reset.`);
  }
}
