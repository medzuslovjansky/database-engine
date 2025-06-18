import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import type { D1MigrationsLogger } from '@interslavic/database-engine-db-d1';
import {
  AggregateRepository,
  AggregateRegistry,
  StreamIdentifier,
  type Event,
  type CommittedEvent,
  AggregateRoot,
  createThresholdSnapshotStrategy,
  type AggregateRepositoryOptions,
} from '@interslavic/database-engine-eventstore';

import { D1EventStore, D1EventStoreUnitOfWork, D1SnapshotStore, D1UnitOfWork, D1EventStoreMigrations } from '../src';

// Define a simple aggregate for testing
interface TestState {
  id: string;
  value: number;
  history: string[];
}

type TestEvent =
  | Event<'Created', { id: string; initialValue: number }>
  | Event<'ValueUpdated', { newValue: number }>
  | Event<'HistoryAppended', { entry: string }>;

class TestAggregate extends AggregateRoot<TestState, TestEvent> {
  constructor(stream: StreamIdentifier, revision: number, state: TestState) {
    super(stream, revision, state);
  }

  static create(id: string | StreamIdentifier, initialValue = 0): TestAggregate {
    const streamId = typeof id === 'string' ? new StreamIdentifier('test', id) : id;
    const initialState: TestState = { id: streamId.id, value: 0, history: [] };
    const agg = new TestAggregate(streamId, 0, initialState);
    agg.raise('Created', { id: streamId.id, initialValue });
    return agg;
  }

  updateValue(newValue: number): void {
    this.raise('ValueUpdated', { newValue });
  }

  appendHistory(entry: string): void {
    this.raise('HistoryAppended', { entry });
  }

  protected doApply(event: TestEvent): void {
    switch (event.type) {
      case 'Created': {
        this.state = { ...this.state, id: event.data.id, value: event.data.initialValue, history: [`Created with ${event.data.initialValue}`] };
        break;
      }
      case 'ValueUpdated': {
        this.state = { ...this.state, value: event.data.newValue, history: [...this.state.history, `Value updated to ${event.data.newValue}`] };
        break;
      }
      case 'HistoryAppended': {
        this.state = { ...this.state, history: [...this.state.history, event.data.entry] };
        break;
      }
      default: {
        // Ensure exhaustiveness if needed, or throw for unknown event
        break;
      }
    }
  }
}

const EVENTS_TABLE_NAME = 'Events';
const SNAPSHOTS_TABLE_NAME = 'Snapshots';

describe('D1 EventStore End-to-End Integration Suite', () => {
  let db: D1Database;
  let aggregateRepository: AggregateRepository;
  let aggregateRegistry: AggregateRegistry;
  let migrations: D1EventStoreMigrations;
  let logger: D1MigrationsLogger;

  // D1 Stores and UoW instances - will be initialized in beforeAll/beforeEach
  let d1EventStore: D1EventStore;
  let d1SnapshotStore: D1SnapshotStore;
  // platformUoW will be created per test or operation where needed, wrapping a D1PlatformUnitOfWork

  beforeAll(async () => {
    db = globalThis.__MINIFLARE_DB__;

    // Create logger mock
    logger = {
      runningMigration: vi.fn(),
      rollingBackMigration: vi.fn(),
    };

    // Instantiate stores (actual classes will be created later)
    // For now, these are just illustrative of what we will need.
    d1EventStore = new D1EventStore({ db, tableName: EVENTS_TABLE_NAME, batchSize: 1 });
    d1SnapshotStore = new D1SnapshotStore({ db, tableName: SNAPSHOTS_TABLE_NAME });

    // Create migration system and run migrations
    migrations = new D1EventStoreMigrations({ db, logger });
    await migrations.up();

    aggregateRegistry = new AggregateRegistry();
    aggregateRegistry.register<TestState>({
      prefix: 'test',
      factory: (streamId, revision, state) => new TestAggregate(streamId, revision, state!),
      serialize: (state) => JSON.stringify(state),
      deserialize: (json) => JSON.parse(json) as TestState,
    });
  });

  beforeEach(async () => {
    // Clear tables before each test to ensure isolation
    await db.exec(`DELETE FROM ${EVENTS_TABLE_NAME};`);
    await db.exec(`DELETE FROM ${SNAPSHOTS_TABLE_NAME};`);

    // Re-initialize the repository for each test to ensure clean state and UoW
    // The PlatformUnitOfWork will be created on-demand when saving aggregates.
    const platformUoWFactory = () => new D1EventStoreUnitOfWork({
        d1UnitOfWork: new D1UnitOfWork({ db }),
        eventStore: d1EventStore, // The same d1EventStore instance
        snapshotStore: d1SnapshotStore, // The same d1SnapshotStore instance
    });

    const repoOptions: AggregateRepositoryOptions = {
      aggregateRegistry,
      eventStore: d1EventStore, // The D1EventStore instance
      snapshotStore: d1SnapshotStore, // The D1SnapshotStore instance
      unitOfWork: platformUoWFactory(), // A fresh UoW for the repository scope, if needed by its internal structure for save.
                                      // More typically, UoW is passed to save method.
      shouldSaveSnapshot: createThresholdSnapshotStrategy(2), // Snapshot every 2 events
    };
    aggregateRepository = new AggregateRepository(repoOptions);
  });

  it('should save a new aggregate and its events, then load it back correctly', async () => {
    const aggId = 'agg1';
    const testAgg = TestAggregate.create(aggId, 10);
    testAgg.updateValue(20);
    testAgg.appendHistory('First update done'); // 3 events total: Created, ValueUpdated, HistoryAppended

    // Create a UoW for this specific save operation
    const uowForSave = new D1EventStoreUnitOfWork({
      d1UnitOfWork: new D1UnitOfWork({ db }),
      eventStore: d1EventStore,
      snapshotStore: d1SnapshotStore
    });

    await aggregateRepository.save(testAgg); // This should use the UoW provided in repo options or handle its own
    await uowForSave.commit(); // This commit assumes AggregateRepository.save() stages to the UoW passed to it, or one it creates.
                               // Let's refine this part once AggregateRepository and D1PlatformUnitOfWork interaction is clearer.

    // For now, let's assume AggregateRepository.save uses the UoW from its constructor for staging,
    // and we need a separate commit for that UoW.
    // This part of the test needs to align with how AggregateRepository uses its UnitOfWork.
    // The `AggregateRepository` in the attached code seems to stage events/snapshots to `this.config.unitOfWork`.
    // So we need to commit *that* unit of work.

    // Let's get the UoW that was configured into the repository
    const repoUoW = (aggregateRepository as any).config.unitOfWork as D1EventStoreUnitOfWork;
    await repoUoW.commit();


    const loadedAgg = await aggregateRepository.load<TestAggregate>(testAgg.stream);

    expect(loadedAgg.revision).toBe(3);
    expect(loadedAgg.state.value).toBe(20);
    expect(loadedAgg.state.history.length).toBe(3);
    expect(loadedAgg.state.history[2]).toBe('First update done');

    // Verify events in DB (optional, but good for sanity check)
    const streamEvents: CommittedEvent[] = [];
    for await (const batch of d1EventStore.readStream({ stream: testAgg.stream })) {
      streamEvents.push(...batch);
    }
    expect(streamEvents.length).toBe(3);
    expect(streamEvents[0].type).toBe('Created');
    expect(streamEvents[1].type).toBe('ValueUpdated');
    expect(streamEvents[2].type).toBe('HistoryAppended');

    // Verify snapshot (since 3 events > threshold of 2)
    const snapshots = await d1SnapshotStore.getLatest<TestState>([testAgg.stream]);
    expect(snapshots.length).toBe(1);
    expect(snapshots[0].revision).toBe(3);
    expect(snapshots[0].data.value).toBe(20);

    // Log the actual DB contents to prove data is really in the D1 database
    console.log('\n\n==== EVENTS IN DATABASE ====');
    const rawEvents = await db.prepare(`SELECT * FROM ${EVENTS_TABLE_NAME} ORDER BY id`).all();
    console.log(JSON.stringify(rawEvents.results, null, 2));

    console.log('\n==== SNAPSHOTS IN DATABASE ====');
    const rawSnapshots = await db.prepare(`SELECT * FROM ${SNAPSHOTS_TABLE_NAME}`).all();
    console.log(JSON.stringify(rawSnapshots.results, null, 2));
    console.log('============================\n\n');

    // Add detailed logging about the loaded aggregate
    console.log('\n==== LOADED AGGREGATE ====');
    console.log('Type of state:', typeof loadedAgg.state);
    console.log('Type of state.value:', typeof loadedAgg.state.value);
    console.log('Type of state.history:', Array.isArray(loadedAgg.state.history) ? 'Array' : typeof loadedAgg.state.history);
    console.log('Full state:', loadedAgg.state);

    // Check the first event's data type
    console.log('\n==== FIRST EVENT DATA TYPES ====');
    const firstEvent = streamEvents[0];
    console.log('Event type:', firstEvent.type);
    console.log('Type of event.data:', typeof firstEvent.data);
    console.log('Is data object?', firstEvent.data !== null && typeof firstEvent.data === 'object' && !Array.isArray(firstEvent.data));
    console.log('Data value:', firstEvent.data);
  });

  // Add a new test specifically for snapshot loading
  it('should load an aggregate from snapshot and apply newer events', async () => {
    const aggId = 'agg2';
    const testAgg = TestAggregate.create(aggId, 100);

    // Add first batch of events (will create a snapshot after 2 events)
    testAgg.updateValue(200);
    testAgg.appendHistory('First batch');  // 3 events total, should trigger snapshot at revision 3

    // Save the aggregate using repository's unit of work
    await aggregateRepository.save(testAgg);

    // Get and commit the repository's UoW
    const repoUoW = (aggregateRepository as any).config.unitOfWork as D1EventStoreUnitOfWork;
    await repoUoW.commit();

    // Verify snapshot was created
    const firstSnapshots = await d1SnapshotStore.getLatest<TestState>([testAgg.stream]);
    expect(firstSnapshots.length).toBe(1);
    expect(firstSnapshots[0].revision).toBe(3);
    console.log('\n==== SNAPSHOT VERIFICATION ====');
    console.log('Snapshot at revision:', firstSnapshots[0].revision);
    console.log('Snapshot state:', firstSnapshots[0].data);

    // Add more events to the aggregate
    testAgg.updateValue(300);
    testAgg.appendHistory('Second batch');  // Now at revision 5

    // Save the updated aggregate
    await aggregateRepository.save(testAgg);
    await repoUoW.commit();

    // Verify that we can load the aggregate from scratch
    // This should use the snapshot + newer events
    const loadedAgg = await aggregateRepository.load<TestAggregate>(testAgg.stream);

    // Verify the aggregate was reconstructed correctly
    expect(loadedAgg.revision).toBe(5);
    expect(loadedAgg.state.value).toBe(300);
    expect(loadedAgg.state.history.length).toBe(5);
    console.log('\n==== AGGREGATE LOADED FROM SNAPSHOT + EVENTS ====');
    console.log('Aggregate revision:', loadedAgg.revision);
    console.log('Aggregate state:', loadedAgg.state);

    // Verify a new snapshot was created (since we added 2 more events)
    const secondSnapshots = await d1SnapshotStore.getLatest<TestState>([testAgg.stream]);
    expect(secondSnapshots.length).toBe(1);
    expect(secondSnapshots[0].revision).toBe(5); // Should have latest revision
    console.log('\n==== UPDATED SNAPSHOT ====');
    console.log('New snapshot at revision:', secondSnapshots[0].revision);
    console.log('New snapshot state:', secondSnapshots[0].data);

    // Check that events were loaded correctly
    const allEvents: CommittedEvent[] = [];
    for await (const batch of d1EventStore.readStream({ stream: testAgg.stream })) {
      allEvents.push(...batch);
    }
    expect(allEvents.length).toBe(5);
  });

  // Test optimistic concurrency
  it('should fail with concurrency error when saving an aggregate with outdated revision', async () => {
    // Create a new aggregate for this test
    const aggId = 'concurrency-test';
    const testAgg = TestAggregate.create(aggId, 50);

    // Save the initial state (revision 1 after Created event)
    await aggregateRepository.save(testAgg);
    const repoUoW = (aggregateRepository as any).config.unitOfWork as D1EventStoreUnitOfWork;
    await repoUoW.commit();

    // Load the same aggregate twice (both at revision 1)
    const aggregate1 = await aggregateRepository.load<TestAggregate>(testAgg.stream);
    const aggregate2 = await aggregateRepository.load<TestAggregate>(testAgg.stream);

    console.log('\n==== CONCURRENCY TEST INITIAL STATE ====');
    console.log('Aggregate 1 revision:', aggregate1.revision);
    console.log('Aggregate 2 revision:', aggregate2.revision);

    // Modify and save the first aggregate
    aggregate1.updateValue(100);
    await aggregateRepository.save(aggregate1);
    await repoUoW.commit();

    console.log('\n==== AFTER FIRST SAVE ====');
    console.log('Aggregate 1 revision after save:', aggregate1.revision);

    // Verify the stream in the database has been updated
    const eventsAfterFirstSave: CommittedEvent[] = [];
    for await (const batch of d1EventStore.readStream({ stream: testAgg.stream })) {
      eventsAfterFirstSave.push(...batch);
    }
    console.log('Events in database:', eventsAfterFirstSave.length);
    console.log('Last event type:', eventsAfterFirstSave.at(-1)!.type);

    // Now try to modify and save the second aggregate (should fail due to revision conflict)
    aggregate2.updateValue(200);  // This change would be lost if allowed to save

    console.log('\n==== BEFORE SECOND SAVE ====');
    console.log('Aggregate 2 revision before save:', aggregate2.revision);

    // Attempt to save should throw an error due to concurrency violation
    let concurrencyErrorThrown = false;
    try {
      await aggregateRepository.save(aggregate2);
      await repoUoW.commit();
    } catch (error) {
      concurrencyErrorThrown = true;
      console.log('\n==== CONCURRENCY ERROR ====');
      console.log('Error caught as expected:', (error as Error).message);
    }

    // Verify that an error was thrown
    expect(concurrencyErrorThrown).toBe(true);

    // Verify the database wasn't changed by the second save attempt
    const finalEvents: CommittedEvent[] = [];
    for await (const batch of d1EventStore.readStream({ stream: testAgg.stream })) {
      finalEvents.push(...batch);
    }

    console.log('\n==== FINAL DATABASE STATE ====');
    console.log('Total events in stream:', finalEvents.length);
    console.log('Final revision in DB:', finalEvents.at(-1)!.revision);

    // Verify we still have only the events from the first save
    expect(finalEvents.length).toBe(eventsAfterFirstSave.length);
    expect(finalEvents.at(-1)!.data).not.toEqual({ newValue: 200 });
  });

  // More tests to come:
  // - Loading from snapshot + further events
  // - Saving an existing aggregate (more events, new snapshot)
  // - No snapshot if threshold not met
  // - Optimistic concurrency (attempting to save with wrong revision)
  // - readAll, readStreams (if their D1 implementations become more complex)
});
