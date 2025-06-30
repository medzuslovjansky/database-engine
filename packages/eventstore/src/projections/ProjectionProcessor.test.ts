import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import type { CommittedEvent } from '../envelopes';
import * as errors from '../errors';
import { StreamIdentifier } from '../primitives';

import type { Projection } from './Projection';
import { ProjectionProcessor, type ProjectionProcessorConfig } from './ProjectionProcessor';
import type { ProjectionLoggerFacade } from './ProjectionLoggerFacade';


// Mock ProjectionLoggerFacade
const mockLoggerFacade: ProjectionLoggerFacade = {
  initialized: vi.fn(),
  transitionedToFailed: vi.fn(),
  catchUpGapDetected: vi.fn(),
  catchUpComplete: vi.fn(),
  processingBatchOutOfOrder: vi.fn(),
  processingEventOutOfOrder: vi.fn(),
  failedToProcessEvent: vi.fn(),
  flushMismatch: vi.fn(),
  flushedSuccessfully: vi.fn(),
  failedToExecuteFlush: vi.fn(),
  noProjectionsFoundToRun: vi.fn(),
  allProcessorsFailedOrCompleted: vi.fn(),
  allProcessorsNowFailed: vi.fn(),
  projectionRunCompleted: vi.fn(),
  processorStatusSummary: vi.fn(),
  noProjectionsFoundToReset: vi.fn(),
  projectionNotFoundForReset: vi.fn(),
};

const mockProjection = {
  name: 'test-projection',
  handle: vi.fn(),
  reset: vi.fn(),
  flush: vi.fn(),
  shouldFlush: vi.fn().mockReturnValue(true), // Default to flush after every event
} satisfies Projection;

describe('ProjectionProcessor', () => {
  let processor: ProjectionProcessor;
  let config: ProjectionProcessorConfig;

  const createEvent = (id: number, type = 'TestEvent', data: any = {}): CommittedEvent => ({
    id,
    type,
    data,
    stream: StreamIdentifier.fromString('test/1'),
    revision: id, // Assuming revision matches id for simplicity in tests
    ts: Date.now(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockProjection.shouldFlush.mockReturnValue(true); // Reset to default

    config = {
      projection: mockProjection,
      initialPosition: 0,
      loggerFacade: mockLoggerFacade, // Use the new facade
    };
    processor = new ProjectionProcessor(config);
  });

  afterEach(() => {
    vi.useRealTimers(); // Ensure timers are real after each test if faked
  });

  it('should initialize in CATCHING_UP state and log initialization', () => {
    expect(processor.name).toBe('test-projection');
    expect(processor.currentLastProcessedEventId).toBe(0);
    expect(processor.hasFailed).toBe(false);
    expect(mockLoggerFacade.initialized).toHaveBeenCalledWith('test-projection', 0, 'CATCHING_UP');
    // Check current state by behavior or an internal (if exposed, but prefer behavior)
    // For now, we assume it starts in CATCHING_UP as per constructor
  });

  it('CATCHING_UP: should skip event with ID less than initialPosition + 1', async () => {
    processor = new ProjectionProcessor({ ...config, initialPosition: 1 });
    const oldEvent = createEvent(1);
    await processor.processEvents([oldEvent]);
    expect(mockProjection.handle).not.toHaveBeenCalled();
    expect(processor.currentLastProcessedEventId).toBe(1); // Stays at initial
    expect(processor.hasFailed).toBe(false);
  });

  it('CATCHING_UP: should skip event with ID equal to initialPosition', async () => {
    processor = new ProjectionProcessor({ ...config, initialPosition: 1 });
    const currentEvent = createEvent(1); // Same as initial position
    await processor.processEvents([currentEvent]);
    expect(mockProjection.handle).not.toHaveBeenCalled();
    expect(processor.currentLastProcessedEventId).toBe(1);
  });


  it('CATCHING_UP: should process event with ID initialPosition + 1 and transition to PROCESSING', async () => {
    const event1 = createEvent(1); // initialPosition is 0
    mockProjection.flush.mockResolvedValue(1);

    await processor.processEvents([event1]);

    expect(mockLoggerFacade.catchUpComplete).toHaveBeenCalledWith('test-projection', 0, 'PROCESSING', 1);
    expect(mockProjection.handle).toHaveBeenCalledWith(event1);
    expect(mockProjection.shouldFlush).toHaveBeenCalled();
    expect(mockProjection.flush).toHaveBeenCalled();
    expect(mockLoggerFacade.flushedSuccessfully).toHaveBeenCalledWith('test-projection', 1, 1, 0);
    expect(processor.currentLastProcessedEventId).toBe(1);
    expect(processor.hasFailed).toBe(false);
  });

  it('CATCHING_UP: should detect gap and fail if first relevant event ID is > initialPosition + 1', async () => {
    const event2 = createEvent(2); // initialPosition is 0, expected 1

    await expect(processor.processEvents([event2])).rejects.toThrow(errors.ProjectionProcessingError);

    expect(mockLoggerFacade.catchUpGapDetected).toHaveBeenCalledWith('test-projection', 1, 0, 2);
    expect(mockLoggerFacade.transitionedToFailed).toHaveBeenCalledWith('test-projection');
    expect(mockProjection.handle).not.toHaveBeenCalled();
    expect(mockProjection.flush).not.toHaveBeenCalled();
    expect(processor.hasFailed).toBe(true);
    expect(processor.currentLastProcessedEventId).toBe(0);
  });


  it('PROCESSING: should process a single event and flush if shouldFlush is true', async () => {
    // Transition to PROCESSING state first
    const event0 = createEvent(1);
    mockProjection.flush.mockResolvedValue(1);
    await processor.processEvents([event0]); // Now at ID 1, in PROCESSING
    vi.clearAllMocks(); // Clear mocks after setup
    mockProjection.shouldFlush.mockReturnValue(true); // Ensure for this test
    mockProjection.flush.mockResolvedValue(2);


    const event1 = createEvent(2);
    await processor.processEvents([event1]);

    expect(mockProjection.handle).toHaveBeenCalledWith(event1);
    expect(mockProjection.shouldFlush).toHaveBeenCalled();
    expect(mockProjection.flush).toHaveBeenCalled();
    expect(mockLoggerFacade.flushedSuccessfully).toHaveBeenCalledWith('test-projection', 1, 2, 0);
    expect(processor.currentLastProcessedEventId).toBe(2);
    expect(processor.hasFailed).toBe(false);
  });

  it('PROCESSING: should process multiple events and flush after each if shouldFlush is true', async () => {
    // Setup: process event 1 to reach 'PROCESSING' state with current ID 1
    mockProjection.flush.mockResolvedValueOnce(1); // For event1
    await processor.processEvents([createEvent(1)]); // initial catchup, current ID 1
    expect(processor.currentLastProcessedEventId).toBe(1); // Verify setup

    vi.clearAllMocks(); // Clears the flush mock too
    mockProjection.shouldFlush.mockReturnValue(true); // Re-assert for this test part

    const event2 = createEvent(2);
    const event3 = createEvent(3);
    mockProjection.flush.mockResolvedValueOnce(2).mockResolvedValueOnce(3); // For event2 and event3

    await processor.processEvents([event2, event3]);

    expect(mockProjection.handle).toHaveBeenCalledWith(event2);
    expect(mockProjection.handle).toHaveBeenCalledWith(event3);
    expect(mockProjection.flush).toHaveBeenCalledTimes(2);
    expect(mockLoggerFacade.flushedSuccessfully).toHaveBeenCalledWith('test-projection', 1, 2, 0); // After event2
    expect(mockLoggerFacade.flushedSuccessfully).toHaveBeenCalledWith('test-projection', 1, 3, 0); // After event3
    expect(processor.currentLastProcessedEventId).toBe(3);
  });

  it('PROCESSING: should accumulate events and flush at batch end if shouldFlush is false', async () => {
    // Setup: process event 1
    mockProjection.flush.mockResolvedValueOnce(1); // For event1
    await processor.processEvents([createEvent(1)]); // Catch-up, current ID 1
    expect(processor.currentLastProcessedEventId).toBe(1);

    vi.clearAllMocks();
    mockProjection.shouldFlush.mockReturnValue(false); // Key for this test

    const event2 = createEvent(2);
    const event3 = createEvent(3);
    mockProjection.flush.mockResolvedValue(3); // Will flush up to 3 at the end

    await processor.processEvents([event2, event3]);

    expect(mockProjection.handle).toHaveBeenCalledWith(event2);
    expect(mockProjection.handle).toHaveBeenCalledWith(event3);
    expect(mockProjection.shouldFlush).toHaveBeenCalledTimes(2); // Called for each
    expect(mockProjection.flush).toHaveBeenCalledTimes(1); // Only at the end
    expect(mockLoggerFacade.flushedSuccessfully).toHaveBeenCalledWith('test-projection', 2, 3, 0);
    expect(processor.currentLastProcessedEventId).toBe(3);
  });

  it('PROCESSING: should fail if event batch starts with wrong ID (after initial catch-up)', async () => {
    // Setup: process event 1
    mockProjection.flush.mockResolvedValueOnce(1); // For event1
    await processor.processEvents([createEvent(1)]); // Process event 1, current ID 1
    expect(processor.currentLastProcessedEventId).toBe(1);

    vi.clearAllMocks();
    // shouldFlush defaults to true from beforeEach, not critical here as handle/flush shouldn't proceed.

    const event3 = createEvent(3); // Expected 2

    await expect(processor.processEvents([event3])).rejects.toThrow(errors.ProjectionProcessingError);

    expect(mockProjection.handle).not.toHaveBeenCalled();
    expect(mockLoggerFacade.processingBatchOutOfOrder).toHaveBeenCalledWith('test-projection', 2, 1, 3);
    expect(mockLoggerFacade.transitionedToFailed).toHaveBeenCalledWith('test-projection');
    expect(processor.hasFailed).toBe(true);
    expect(processor.currentLastProcessedEventId).toBe(1); // Remains at last successful
  });

  it('PROCESSING: should fail if an event within a batch is out of order', async () => {
    // Setup: process event 1
    mockProjection.flush.mockResolvedValueOnce(1); // For event1
    await processor.processEvents([createEvent(1)]); // Process event 1, current ID 1
    expect(processor.currentLastProcessedEventId).toBe(1);

    vi.clearAllMocks();
    mockProjection.shouldFlush.mockReturnValue(false); // Prevent flush for event2 to test pending logic

    const event2 = createEvent(2);
    const event4 = createEvent(4); // Expected 3 after event2

    await expect(processor.processEvents([event2, event4])).rejects.toThrow(errors.ProjectionProcessingError);

    expect(mockProjection.handle).toHaveBeenCalledWith(event2);
    expect(mockProjection.handle).toHaveBeenCalledTimes(1); // Only event2
    expect(mockLoggerFacade.processingEventOutOfOrder).toHaveBeenCalledWith('test-projection', 4, 3, 1, [2]);
    expect(mockLoggerFacade.transitionedToFailed).toHaveBeenCalledWith('test-projection');
    expect(mockProjection.flush).not.toHaveBeenCalled(); // Failed before batch end flush
    expect(processor.hasFailed).toBe(true);
    expect(processor.currentLastProcessedEventId).toBe(1);
  });

  it('PROCESSING: should set hasFailed if projection.handle throws', async () => {
    // Setup: process event 1
    mockProjection.flush.mockResolvedValueOnce(1); // For event1
    await processor.processEvents([createEvent(1)]); // Process event 1, current ID 1
    expect(processor.currentLastProcessedEventId).toBe(1);

    vi.clearAllMocks();
    mockProjection.shouldFlush.mockReturnValue(true); // Ensure flush would be attempted if handle didn't throw

    const event2 = createEvent(2);
    const errorMessage = 'Handler error';
    mockProjection.handle.mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await expect(processor.processEvents([event2])).rejects.toThrow(errors.ProjectionProcessingError);

    expect(mockProjection.handle).toHaveBeenCalledWith(event2);
    expect(mockLoggerFacade.failedToProcessEvent).toHaveBeenCalledWith('test-projection', 2, event2.type, expect.any(Error));
    expect(mockLoggerFacade.transitionedToFailed).toHaveBeenCalledWith('test-projection');
    expect(processor.hasFailed).toBe(true);
    expect(mockProjection.flush).not.toHaveBeenCalled();
    expect(processor.currentLastProcessedEventId).toBe(1);
  });

  it('FAILED: should not process events if hasFailed is true', async () => {
    // Setup: process event 1 successfully
    mockProjection.flush.mockResolvedValueOnce(1); // For event1 processing
    await processor.processEvents([createEvent(1)]); // Process event 1, current ID 1
    expect(processor.currentLastProcessedEventId).toBe(1); // Verify current ID is 1

    // Cause failure with event 2.
    vi.clearAllMocks(); // Clear mocks from event1 processing
    mockProjection.shouldFlush.mockReturnValue(true); // Restore default or set as needed

    const event2 = createEvent(2);
    mockProjection.handle.mockImplementationOnce(() => { throw new Error('fail'); });

    await expect(processor.processEvents([event2])).rejects.toThrow(errors.ProjectionProcessingError);

    expect(mockProjection.handle).toHaveBeenCalledWith(event2); // Handle for event2 IS called
    expect(mockLoggerFacade.failedToProcessEvent).toHaveBeenCalledWith('test-projection', 2, 'TestEvent', expect.any(Error));
    expect(processor.hasFailed).toBe(true);
    expect(mockLoggerFacade.transitionedToFailed).toHaveBeenCalledWith('test-projection');
    expect(processor.currentLastProcessedEventId).toBe(1); // Remains at 1 (pre-event2)

    vi.clearAllMocks(); // Clear mocks after failure setup

    const event3 = createEvent(3);

    await expect(processor.processEvents([event3])).rejects.toThrow();

    expect(mockProjection.handle).not.toHaveBeenCalled(); // Not called for event3
    expect(mockLoggerFacade.failedToProcessEvent).not.toHaveBeenCalled(); // No new processing errors
    expect(processor.currentLastProcessedEventId).toBe(1); // Remains at last successful before fail
  });

  it('PROCESSING: should fail if projection.flush throws', async () => {
    // Setup: process event 1
    mockProjection.flush.mockResolvedValueOnce(1); // For event1
    await processor.processEvents([createEvent(1)]); // Process event 1, current ID 1
    expect(processor.currentLastProcessedEventId).toBe(1);

    vi.clearAllMocks();
    mockProjection.shouldFlush.mockReturnValue(true); // Ensure flush is attempted

    const event2 = createEvent(2);
    const errorMessage = 'Flush error';
    mockProjection.flush.mockRejectedValue(new Error(errorMessage)); // Mock flush for event2 to throw

    // Test for the exact error message shown in the test output
    await expect(processor.processEvents([event2])).rejects.toThrow(errors.ProjectionProcessingError);

    expect(mockProjection.handle).toHaveBeenCalledWith(event2);
    expect(mockProjection.flush).toHaveBeenCalledTimes(1); // Called once for event2
    expect(mockLoggerFacade.failedToExecuteFlush).toHaveBeenCalledWith('test-projection', 2, expect.any(Error));
    expect(mockLoggerFacade.transitionedToFailed).toHaveBeenCalledWith('test-projection');
    expect(processor.hasFailed).toBe(true);
    expect(processor.currentLastProcessedEventId).toBe(1); // Reverts to pre-flush ID on error
  });

  it('PROCESSING: should fail if flushedToEventId does not match last event ID in flushed set', async () => {
    // Setup: process event 1
    mockProjection.flush.mockResolvedValueOnce(1); // For event1
    await processor.processEvents([createEvent(1)]); // Process event 1, current ID 1
    expect(processor.currentLastProcessedEventId).toBe(1);

    vi.clearAllMocks();
    mockProjection.shouldFlush.mockReturnValue(false); // Accumulate to test multi-event flush

    const event2 = createEvent(2);
    const event3 = createEvent(3);
    // Batch will be [event2, event3]. Last event ID in set is 3.
    // Projection reports it only flushed up to 2
    mockProjection.flush.mockResolvedValue(2);

    // Using the exact error message format
    await expect(processor.processEvents([event2, event3])).rejects.toThrow(errors.ProjectionFlushError);

    expect(mockProjection.handle).toHaveBeenCalledWith(event2);
    expect(mockProjection.handle).toHaveBeenCalledWith(event3);
    expect(mockProjection.flush).toHaveBeenCalledTimes(1); // End of batch flush
    expect(mockLoggerFacade.flushMismatch).toHaveBeenCalledWith('test-projection', 2, 3);
    expect(mockLoggerFacade.transitionedToFailed).toHaveBeenCalledWith('test-projection');
    expect(processor.hasFailed).toBe(true);
    expect(processor.currentLastProcessedEventId).toBe(1); // Remains at pre-failed-flush ID
  });

  it('should correctly process events when initialPosition is not 0 (integration of CATCHING_UP and PROCESSING)', async () => {
    processor = new ProjectionProcessor({ ...config, initialPosition: 5 });
    expect(mockLoggerFacade.initialized).toHaveBeenCalledWith('test-projection', 5, 'CATCHING_UP');

    const event6 = createEvent(6);
    const event7 = createEvent(7);
    mockProjection.flush.mockResolvedValueOnce(6).mockResolvedValueOnce(7); // Flush after each due to default shouldFlush=true

    await processor.processEvents([event6, event7]);

    expect(mockLoggerFacade.catchUpComplete).toHaveBeenCalledWith('test-projection', 5, 'PROCESSING', 6);
    expect(mockProjection.handle).toHaveBeenCalledWith(event6);
    expect(mockLoggerFacade.flushedSuccessfully).toHaveBeenCalledWith('test-projection', 1, 6, 0);
    expect(mockProjection.handle).toHaveBeenCalledWith(event7);
    expect(mockLoggerFacade.flushedSuccessfully).toHaveBeenCalledWith('test-projection', 1, 7, 0);
    expect(processor.currentLastProcessedEventId).toBe(7);
    expect(processor.hasFailed).toBe(false);
  });

  it('should not call handle or flush if events array is empty', async () => {
    await processor.processEvents([]);
    expect(mockProjection.handle).not.toHaveBeenCalled();
    expect(mockProjection.flush).not.toHaveBeenCalled();
    expect(processor.hasFailed).toBe(false);
  });

  it('should handle subsequent batches correctly after a successful flush', async () => {
    // Batch 1: CATCHING_UP -> PROCESSING
    const event1 = createEvent(1);
    const event2 = createEvent(2);
    mockProjection.flush.mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    await processor.processEvents([event1, event2]);
    expect(processor.currentLastProcessedEventId).toBe(2);
    expect(mockProjection.handle).toHaveBeenCalledTimes(2);
    expect(mockProjection.flush).toHaveBeenCalledTimes(2);
    expect(mockLoggerFacade.flushedSuccessfully).toHaveBeenLastCalledWith('test-projection',1,2,0);
    vi.clearAllMocks(); // Clear after first batch

    // Batch 2: Already in PROCESSING
    const event3 = createEvent(3);
    const event4 = createEvent(4);
    mockProjection.flush.mockResolvedValueOnce(3).mockResolvedValueOnce(4);
    await processor.processEvents([event3, event4]);
    expect(processor.currentLastProcessedEventId).toBe(4);
    expect(mockProjection.handle).toHaveBeenCalledTimes(2); // For this batch
    expect(mockProjection.flush).toHaveBeenCalledTimes(2); // For this batch
    expect(mockLoggerFacade.flushedSuccessfully).toHaveBeenLastCalledWith('test-projection',1,4,0);
    expect(processor.hasFailed).toBe(false);
  });
});
