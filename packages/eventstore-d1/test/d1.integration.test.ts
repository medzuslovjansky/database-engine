import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import type { D1MigrationsLogger } from '@interslavic/database-engine-database-d1';
import { D1UnitOfWork } from '@interslavic/database-engine-database-d1';
import {
  AggregateRepository,
  AggregateRegistry,
  createThresholdSnapshotStrategy,
  type AggregateRepositoryOptions,
  type CommittedEvent,
} from '@interslavic/database-engine-eventstore';
import { Counter, type CounterState } from '@interslavic/database-engine-eventstore-memory/test';
import { D1EventStore, D1EventStoreUnitOfWork, D1SnapshotStore, D1EventStoreMigrations } from '@interslavic/database-engine-eventstore-d1';

// Import Counter from eventstore test domain

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

  beforeAll(async () => {
    db = globalThis.__MINIFLARE_DB__;

    // Create logger mock
    logger = {
      runningMigration: vi.fn(),
      rollingBackMigration: vi.fn(),
    };

    aggregateRegistry = new AggregateRegistry();
    // Instantiate stores
    d1EventStore = new D1EventStore({ db, tableName: EVENTS_TABLE_NAME, batchSize: 1 });
    d1SnapshotStore = new D1SnapshotStore({ db, aggregateRegistry, tableName: SNAPSHOTS_TABLE_NAME });

    // Create migration system and run migrations
    migrations = new D1EventStoreMigrations({ db, logger });
    await migrations.up();

    // Register Counter aggregate with correct syntax
    aggregateRegistry.register<CounterState>({
      prefix: 'counter',
      constructor: Counter,
    });
  });

  beforeEach(async () => {
    // Clear tables before each test to ensure isolation
    await db.exec(`DELETE FROM ${EVENTS_TABLE_NAME};`);
    await db.exec(`DELETE FROM ${SNAPSHOTS_TABLE_NAME};`);

    // Re-initialize the repository for each test to ensure clean state and UoW
    const platformUoWFactory = () => new D1EventStoreUnitOfWork({
      d1UnitOfWork: new D1UnitOfWork({ db }),
      eventStore: d1EventStore,
      snapshotStore: d1SnapshotStore,
    });

    const repoOptions: AggregateRepositoryOptions = {
      aggregateRegistry,
      eventStore: d1EventStore,
      snapshotStore: d1SnapshotStore,
      unitOfWork: platformUoWFactory(),
      shouldSaveSnapshot: createThresholdSnapshotStrategy(2), // Snapshot every 2 events
    };
    aggregateRepository = new AggregateRepository(repoOptions);
  });

  it('should save a new counter and its events, then load it back correctly', async () => {
    const counterId = 'counter1';
    const counter = Counter.create(counterId, 10);
    counter.increment(5);
    counter.decrement(2); // 3 events total: CounterReset (from create), CounterIncremented, CounterDecremented

    // Get the UoW that was configured into the repository
    const repoUoW = (aggregateRepository as any).config.unitOfWork as D1EventStoreUnitOfWork;

    await aggregateRepository.save(counter);
    await repoUoW.commit();

    const loadedCounter = await aggregateRepository.loadStrict<Counter>(counter.stream);

    expect(loadedCounter.revision).toBe(3);
    expect(loadedCounter.state.value).toBe(13); // 10 + 5 - 2 = 13

    // Verify events in DB
    const streamEvents: CommittedEvent[] = [];
    for await (const batch of d1EventStore.readStream({ stream: counter.stream })) {
      streamEvents.push(...batch);
    }
    expect(streamEvents.length).toBe(3);
    expect(streamEvents[0].type).toBe('CounterReset');
    expect(streamEvents[1].type).toBe('CounterIncremented');
    expect(streamEvents[2].type).toBe('CounterDecremented');

    // Verify snapshot (since 3 events > threshold of 2)
    const snapshots = await d1SnapshotStore.getLatest<CounterState>([counter.stream]);
    expect(snapshots.length).toBe(1);
    expect(snapshots[0].revision).toBe(3);
    expect(snapshots[0].data.value).toBe(13);

    // Log the actual DB contents
    console.log('\n\n==== EVENTS IN DATABASE ====');
    const rawEvents = await db.prepare(`SELECT * FROM ${EVENTS_TABLE_NAME} ORDER BY id`).all();
    console.log(JSON.stringify(rawEvents.results, null, 2));

    console.log('\n==== SNAPSHOTS IN DATABASE ====');
    const rawSnapshots = await db.prepare(`SELECT * FROM ${SNAPSHOTS_TABLE_NAME}`).all();
    console.log(JSON.stringify(rawSnapshots.results, null, 2));
    console.log('============================\n\n');

    // Add detailed logging about the loaded aggregate
    console.log('\n==== LOADED COUNTER ====');
    console.log('Type of state:', typeof loadedCounter.state);
    console.log('Type of state.value:', typeof loadedCounter.state.value);
    console.log('Full state:', loadedCounter.state);

    // Check the first event's data type
    console.log('\n==== FIRST EVENT DATA TYPES ====');
    const firstEvent = streamEvents[0];
    console.log('Event type:', firstEvent.type);
    console.log('Type of event.data:', typeof firstEvent.data);
    console.log('Is data object?', firstEvent.data !== null && typeof firstEvent.data === 'object' && !Array.isArray(firstEvent.data));
    console.log('Data value:', firstEvent.data);
  });

  // Add a new test specifically for snapshot loading
  it('should load a counter from snapshot and apply newer events', async () => {
    const counterId = 'counter2';
    const counter = Counter.create(counterId, 100);

    // Add first batch of events (will create a snapshot after 2 events)
    counter.increment(50);
    counter.decrement(25);  // 3 events total, should trigger snapshot at revision 3

    // Save the counter using repository's unit of work
    await aggregateRepository.save(counter);

    // Get and commit the repository's UoW
    const repoUoW = (aggregateRepository as any).config.unitOfWork as D1EventStoreUnitOfWork;
    await repoUoW.commit();

    // Verify snapshot was created
    const firstSnapshots = await d1SnapshotStore.getLatest<CounterState>([counter.stream]);
    expect(firstSnapshots.length).toBe(1);
    expect(firstSnapshots[0].revision).toBe(3);
    console.log('\n==== SNAPSHOT VERIFICATION ====');
    console.log('Snapshot at revision:', firstSnapshots[0].revision);
    console.log('Snapshot state:', firstSnapshots[0].data);

    // Add more events to the counter
    counter.increment(10);
    counter.reset(200);  // Now at revision 5

    // Save the updated counter
    await aggregateRepository.save(counter);
    await repoUoW.commit();

    // Verify that we can load the counter from scratch
    // This should use the snapshot + newer events
    const loadedCounter = await aggregateRepository.loadStrict<Counter>(counter.stream);

    // Verify the counter was reconstructed correctly
    expect(loadedCounter.revision).toBe(5);
    expect(loadedCounter.state.value).toBe(200); // Reset to 200
    console.log('\n==== COUNTER LOADED FROM SNAPSHOT + EVENTS ====');
    console.log('Counter revision:', loadedCounter.revision);
    console.log('Counter state:', loadedCounter.state);

    // Verify a new snapshot was created (since we added 2 more events)
    const secondSnapshots = await d1SnapshotStore.getLatest<CounterState>([counter.stream]);
    expect(secondSnapshots.length).toBe(1);
    expect(secondSnapshots[0].revision).toBe(5); // Should have latest revision
    console.log('\n==== UPDATED SNAPSHOT ====');
    console.log('New snapshot at revision:', secondSnapshots[0].revision);
    console.log('New snapshot state:', secondSnapshots[0].data);

    // Check that events were loaded correctly
    const allEvents: CommittedEvent[] = [];
    for await (const batch of d1EventStore.readStream({ stream: counter.stream })) {
      allEvents.push(...batch);
    }
    expect(allEvents.length).toBe(5);
  });

  // Test optimistic concurrency
  it('should fail with concurrency error when saving a counter with outdated revision', async () => {
    // Create a new counter for this test
    const counterId = 'concurrency-test';
    const counter = Counter.create(counterId, 50);

    // Save the initial state (revision 1 after CounterReset event)
    await aggregateRepository.save(counter);
    const repoUoW = (aggregateRepository as any).config.unitOfWork as D1EventStoreUnitOfWork;
    await repoUoW.commit();

    // Load the same counter twice (both at revision 1)
    const counter1 = await aggregateRepository.loadStrict<Counter>(counter.stream);
    const counter2 = await aggregateRepository.loadStrict<Counter>(counter.stream);

    console.log('\n==== CONCURRENCY TEST INITIAL STATE ====');
    console.log('Counter 1 revision:', counter1.revision);
    console.log('Counter 2 revision:', counter2.revision);

    // Modify and save the first counter
    counter1.increment(25);
    await aggregateRepository.save(counter1);
    await repoUoW.commit();

    console.log('\n==== AFTER FIRST SAVE ====');
    console.log('Counter 1 revision after save:', counter1.revision);

    // Verify the stream in the database has been updated
    const eventsAfterFirstSave: CommittedEvent[] = [];
    for await (const batch of d1EventStore.readStream({ stream: counter.stream })) {
      eventsAfterFirstSave.push(...batch);
    }
    console.log('Events in database:', eventsAfterFirstSave.length);
    console.log('Last event type:', eventsAfterFirstSave.at(-1)!.type);

    // Now try to modify and save the second counter (should fail due to revision conflict)
    counter2.increment(100);  // This change would be lost if allowed to save

    console.log('\n==== BEFORE SECOND SAVE ====');
    console.log('Counter 2 revision before save:', counter2.revision);

    // Attempt to save should throw an error due to concurrency violation
    let concurrencyErrorThrown = false;
    try {
      await aggregateRepository.save(counter2);
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
    for await (const batch of d1EventStore.readStream({ stream: counter.stream })) {
      finalEvents.push(...batch);
    }

    console.log('\n==== FINAL DATABASE STATE ====');
    console.log('Total events in stream:', finalEvents.length);
    console.log('Final revision in DB:', finalEvents.at(-1)!.revision);

    // Verify we still have only the events from the first save
    expect(finalEvents.length).toBe(eventsAfterFirstSave.length);
    expect(finalEvents.at(-1)!.data).not.toEqual({ amount: 100 });
  });
});
