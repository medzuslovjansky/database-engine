import { vi, describe, it, expect, beforeEach, MockedFunction } from 'vitest';
import { StreamIdentifier } from '../primitives';
import { AggregateNotFoundError } from '../errors';
import { AggregateRepository } from './AggregateRepository';
import { AggregateRoot } from './AggregateRoot';
import { AggregateRegistry } from './AggregateRegistry';
import type { Event, Snapshot } from '../envelopes';
import type { EventStore, SnapshotStore, UnitOfWork } from '../stores';
import { SnapshotSaveStrategy } from './utils';

type MockAggregateState = { lastEventType: string };

class MockAggregateRoot extends AggregateRoot<MockAggregateState> {
  #state: MockAggregateState;

  constructor(
    streamIdentifier: StreamIdentifier,
    revision: number = 0,
    state: MockAggregateState = { lastEventType: '' }
  ) {
    super(streamIdentifier, revision, state);
    this.#state = state;
  }

  static create(stream: string | StreamIdentifier, revision: number = 1, state: MockAggregateState = { lastEventType: '' }) {
    const streamId = typeof stream === 'string' ? StreamIdentifier.fromString(stream) : stream;
    return new MockAggregateRoot(streamId, revision, state);
  }

  get state(): MockAggregateState {
    return this.#state;
  }

  addTestEvent(type: string): void {
    this.raise(type, {});
  }

  protected doApply(event: Event): void {
    this.#state = { lastEventType: event.type };
  }

  protected getStreamName(): string {
    return this.stream.toString();
  }
}

describe('AggregateRepository', () => {
  let repository: AggregateRepository;
  let mockAggregateRegistry: AggregateRegistry;
  let mockEventStore: EventStore;
  let mockSnapshotStore: SnapshotStore;
  let mockUnitOfWork: UnitOfWork;
  let mockSnapshotStrategy: MockedFunction<SnapshotSaveStrategy>;
  let testAggregate: MockAggregateRoot;

  beforeEach(() => {
    testAggregate = new MockAggregateRoot(
      StreamIdentifier.fromString('test/123'),
      1, // Non-zero revision so it's considered "existing"
      { lastEventType: '' }
    );

    mockAggregateRegistry = new AggregateRegistry()
      .register<MockAggregateState>({
        prefix: 'test',
        factory: MockAggregateRoot.create,
      });

    // spy on the factory method
    vi.spyOn(mockAggregateRegistry, 'instantiate');

    mockEventStore = {
      readStream: vi.fn(),
      readStreams: vi.fn().mockImplementation(function* () {
        yield [];
      }),
      readAll: vi.fn(),
    };

    mockSnapshotStore = {
      getBatch: vi.fn().mockResolvedValue([]),
      getLatest: vi.fn().mockResolvedValue([]),
    };

    mockUnitOfWork = {
      stageEvents: vi.fn(),
      stageSnapshots: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    };

    mockSnapshotStrategy = vi.fn().mockReturnValue(false);

    // Create repository with mocks
    repository = new AggregateRepository({
      aggregateRegistry: mockAggregateRegistry,
      eventStore: mockEventStore,
      unitOfWork: mockUnitOfWork,
      snapshotStore: mockSnapshotStore,
      shouldSaveSnapshot: mockSnapshotStrategy,
    });
  });

  describe('load', () => {
    beforeEach(() => {
      // Ensure the mock aggregate has a non-zero revision
      testAggregate = MockAggregateRoot.create('test/123', 1);

      // Mock the instantiate function to return our test aggregate
      mockAggregateRegistry.instantiate = vi.fn().mockReturnValue(testAggregate);
    });

    it('should load an aggregate from a string ID', async () => {
      const aggregate = await repository.load('test/123');

      expect(mockAggregateRegistry.instantiate).toHaveBeenCalledWith(
        expect.objectContaining({ prefix: 'test', id: '123' }),
        0,
        undefined
      );
      expect(aggregate).toStrictEqual(testAggregate);
    });

    it('should load an aggregate from a StreamIdentifier', async () => {
      const aggregate = await repository.load(StreamIdentifier.fromString('test/123'));

      expect(mockAggregateRegistry.instantiate).toHaveBeenCalledWith(
        expect.objectContaining({ prefix: 'test', id: '123' }),
        0,
        undefined
      );
      expect(aggregate).toStrictEqual(testAggregate);
    });

    it('should throw AggregateNotFoundError if no aggregate is returned', async () => {
      // Mock loadBatch to throw the AggregateNotFoundError directly
      vi.spyOn(repository, 'loadBatch').mockImplementation(async () => {
        throw new AggregateNotFoundError(StreamIdentifier.fromString('test/123'));
      });

      // Use the expect().rejects pattern
      await expect(repository.load('test/123')).rejects.toThrow(AggregateNotFoundError);
    });

    it('should apply events from the event store to the aggregate', async () => {
      // Reset mock aggregate to revision 0 to simulate a fresh aggregate
      testAggregate = MockAggregateRoot.create('test/123', 0);
      mockAggregateRegistry.instantiate = vi.fn().mockReturnValue(testAggregate);

      const events: Event[] = [
        {
          type: 'test-event',
          data: { value: 1 },
          stream: StreamIdentifier.fromString('test/123'),
          revision: 1, // Revision 1 for a fresh aggregate with revision 0
          ts: Date.now(),
        }
      ];

      // Mock readStreams to return events
      mockEventStore.readStreams = vi.fn().mockImplementation(function* () {
        yield events;
      });

      const applyBatchSpy = vi.spyOn(testAggregate, 'applyBatch');
      const aggregate = await repository.load('test/123');

      expect(applyBatchSpy).toHaveBeenCalledWith(events);
      expect(aggregate.state).toEqual({ lastEventType: 'test-event' });
    });

    it('should use snapshot data if available', async () => {
      const snapshotState = { count: 5, lastAction: 'test' };
      const snapshot: Snapshot = {
        stream: StreamIdentifier.fromString('test/123'),
        revision: 3,
        ts: Date.now(),
        data: snapshotState,
      };

      mockSnapshotStore.getLatest = vi.fn().mockResolvedValue([snapshot]);

      const aggregate = await repository.load('test/123');

      expect(mockAggregateRegistry.instantiate).toHaveBeenCalledWith(
        expect.objectContaining({ prefix: 'test', id: '123' }),
        3,
        snapshotState
      );
      expect(aggregate).toStrictEqual(testAggregate);
    });
  });

  describe('loadBatch', () => {
    it('should load multiple aggregates at once', async () => {
      const stream1 = new StreamIdentifier('test', '1');
      const stream2 = new StreamIdentifier('test', '2');

      const aggregate1 = MockAggregateRoot.create(stream1);
      const aggregate2 = MockAggregateRoot.create(stream2);

      mockAggregateRegistry.instantiate = vi.fn()
        .mockImplementationOnce(() => aggregate1)
        .mockImplementationOnce(() => aggregate2);

      const aggregates = await repository.loadBatch([stream1, stream2]);

      expect(mockAggregateRegistry.instantiate).toHaveBeenCalledTimes(2);
      expect(aggregates).toHaveLength(2);
      expect(aggregates[0]).toBe(aggregate1);
      expect(aggregates[1]).toBe(aggregate2);
    });

    it('should handle mix of string IDs and StreamIdentifiers', async () => {
      // Create aggregates with revision 1 so they're considered existing
      const aggregate1 = MockAggregateRoot.create('test/1', 1);
      const aggregate2 = MockAggregateRoot.create('test/2', 1);

      mockAggregateRegistry.instantiate = vi.fn()
        .mockImplementationOnce(() => aggregate1)
        .mockImplementationOnce(() => aggregate2);

      const aggregates = await repository.loadBatch(['test/1', new StreamIdentifier('test', '2')]);

      expect(mockAggregateRegistry.instantiate).toHaveBeenCalledTimes(2);
      expect(mockAggregateRegistry.instantiate).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ prefix: 'test', id: '1' }),
        0,
        undefined
      );
      expect(mockAggregateRegistry.instantiate).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ prefix: 'test', id: '2' }),
        0,
        undefined
      );

      expect(aggregates.length).toBe(2);
    });

    it('should process events for each stream and group them correctly', async () => {
      const stream1 = new StreamIdentifier('test', '1');
      const stream2 = new StreamIdentifier('test', '2');

      // Create aggregates with revision 0 to accept events with revision 1
      const aggregate1 = MockAggregateRoot.create(stream1, 0);
      const aggregate2 = MockAggregateRoot.create(stream2, 0);

      mockAggregateRegistry.instantiate = vi.fn()
        .mockImplementationOnce(() => aggregate1)
        .mockImplementationOnce(() => aggregate2);

      const events: Event[] = [
        { type: 'event1', data: {}, stream: stream1, revision: 1, ts: Date.now() },
        { type: 'event2', data: {}, stream: stream2, revision: 1, ts: Date.now() }
      ];

      mockEventStore.readStreams = vi.fn().mockImplementation(function* () {
        yield events;
      });

      const applyBatchSpy1 = vi.spyOn(aggregate1, 'applyBatch');
      const applyBatchSpy2 = vi.spyOn(aggregate2, 'applyBatch');

      await repository.loadBatch([stream1, stream2]);

      expect(applyBatchSpy1).toHaveBeenCalledWith([events[0]]);
      expect(applyBatchSpy2).toHaveBeenCalledWith([events[1]]);
    });
  });

  describe('save', () => {
    it('should pull events from the aggregate and stage them to the unit of work', async () => {
      testAggregate.addTestEvent('event1');
      testAggregate.addTestEvent('event2');

      const pullEventsSpy = vi.spyOn(testAggregate, 'pullEvents');

      await repository.save(testAggregate);

      expect(pullEventsSpy).toHaveBeenCalled();
      expect(mockUnitOfWork.stageEvents).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: 'event1' }),
          expect.objectContaining({ type: 'event2' })
        ])
      );
    });

    it('should not stage anything if there are no events', async () => {
      await repository.save(testAggregate);

      expect(mockUnitOfWork.stageEvents).not.toHaveBeenCalled();
      expect(mockUnitOfWork.stageSnapshots).not.toHaveBeenCalled();
    });

    it('should create and stage a snapshot if the strategy returns true', async () => {
      testAggregate.addTestEvent('event1');

      // Mock snapshot strategy to return true
      mockSnapshotStrategy.mockReturnValue(true);

      await repository.save(testAggregate);

      expect(mockUnitOfWork.stageSnapshots).toHaveBeenCalledWith([
        expect.objectContaining({
          stream: StreamIdentifier.fromString('test/123'),
          revision: testAggregate.revision,
          data: testAggregate.state
        })
      ]);
    });

    it('should not stage a snapshot if the strategy returns false', async () => {
      testAggregate.addTestEvent('event1');

      // Mock snapshot strategy to return false
      mockSnapshotStrategy.mockReturnValue(false);

      await repository.save(testAggregate);

      expect(mockUnitOfWork.stageSnapshots).not.toHaveBeenCalled();
    });
  });

  describe('saveBatch', () => {
    it('should save multiple aggregates at once', async () => {
      const aggregate1 = MockAggregateRoot.create('test/1');
      const aggregate2 = MockAggregateRoot.create('test/2');

      aggregate1.addTestEvent('event1');
      aggregate2.addTestEvent('event2');

      await repository.saveBatch([aggregate1, aggregate2]);

      expect(mockUnitOfWork.stageEvents).toHaveBeenCalledTimes(2);
      expect(mockUnitOfWork.stageEvents).toHaveBeenNthCalledWith(
        1,
        expect.arrayContaining([expect.objectContaining({ type: 'event1' })])
      );
      expect(mockUnitOfWork.stageEvents).toHaveBeenNthCalledWith(
        2,
        expect.arrayContaining([expect.objectContaining({ type: 'event2' })])
      );
    });

    it('should only save aggregates with uncommitted events', async () => {
      const aggregate1 = MockAggregateRoot.create('test/1');
      const aggregate2 = MockAggregateRoot.create('test/2');

      // Only add event to first aggregate
      aggregate1.addTestEvent('event1');

      await repository.saveBatch([aggregate1, aggregate2]);

      expect(mockUnitOfWork.stageEvents).toHaveBeenCalledTimes(1);
      expect(mockUnitOfWork.stageEvents).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ type: 'event1' })])
      );
    });

    it('should check snapshot strategy for each aggregate', async () => {
      const aggregate1 = MockAggregateRoot.create('test/1');
      const aggregate2 = MockAggregateRoot.create('test/2');

      aggregate1.addTestEvent('event1');
      aggregate2.addTestEvent('event2');

      // Make strategy return true for first aggregate, false for second
      mockSnapshotStrategy
        .mockImplementationOnce(() => true)
        .mockImplementationOnce(() => false);

      await repository.saveBatch([aggregate1, aggregate2]);

      expect(mockSnapshotStrategy).toHaveBeenCalledTimes(2);
      expect(mockUnitOfWork.stageSnapshots).toHaveBeenCalledTimes(1);
      expect(mockUnitOfWork.stageSnapshots).toHaveBeenCalledWith([
        expect.objectContaining({
          stream: aggregate1.stream,
          data: aggregate1.state
        })
      ]);
    });
  });
});
