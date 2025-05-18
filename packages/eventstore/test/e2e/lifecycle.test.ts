import { describe, test, expect, beforeEach } from 'vitest';
import { AggregateFactory, AggregateRepository, AggregateRegistry, createThresholdSnapshotStrategy } from '../../src';
import {
  InMemoryEventStore,
  InMemorySnapshotStore,
  InMemoryUnitOfWork
} from '../memory';
import { Counter, CounterState, CounterEvent } from '../domain';
import { createFreshAggregateRegistry } from './test-helpers';

describe('CQRS Lifecycle', () => {
  // Test infrastructure
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  // Cast to any to work around the type mismatch
  const unitOfWork = new InMemoryUnitOfWork({ eventStore, snapshotStore });
  // Use helper to create a fresh registry for each test
  let aggregateRegistry: AggregateRegistry;

  // Aggregate factory
  const counterFactory: AggregateFactory<CounterState, CounterEvent, Counter> =
    (id, revision, state) => new Counter(id.id, revision, state as CounterState);

  // Repository with snapshot support
  let repository: AggregateRepository;

  beforeEach(() => {
    // Clear stores
    eventStore.clear();
    snapshotStore.clear();

    // Create a fresh registry
    aggregateRegistry = createFreshAggregateRegistry();

    // Register Counter aggregate
    aggregateRegistry.register({
      prefix: 'counter',
      factory: counterFactory
    });

    // Create a fresh repository
    repository = new AggregateRepository({
      aggregateRegistry,
      eventStore,
      unitOfWork,
      snapshotStore,
      shouldSaveSnapshot: createThresholdSnapshotStrategy(2),
    });
  });

  test('should demonstrate complete aggregate lifecycle with events and snapshots', async () => {
    //
    // Step 1: Create and modify aggregate
    //

    // Create new counter
    const counter = Counter.create('lifecycle', 10);
    expect(counter.state.value).toBe(10);
    expect(counter.revision).toBe(1);

    // Perform operations
    counter.increment(5);
    counter.increment(10);
    counter.decrement(3);

    // Revision should be updated
    expect(counter.revision).toBe(4);
    expect(counter.state.value).toBe(22); // 10 + 5 + 10 - 3

    // Save changes
    await repository.save(counter);
    await unitOfWork.commit();

    // Verify events in store
    expect(eventStore.eventCount).toBe(4);

    // Should have one snapshot after 4 events (crossing threshold of 2)
    expect(snapshotStore.allSnapshots.length).toBe(1);

    //
    // Step 2: Load aggregate and modify
    //

    // Load counter
    const loadedCounter = await repository.load<Counter>('counter/lifecycle');
    expect(loadedCounter).not.toBeNull();
    expect(loadedCounter?.state.value).toBe(22);
    expect(loadedCounter?.revision).toBe(4);

    // Perform more operations
    loadedCounter?.increment(8);
    loadedCounter?.reset(15);

    // Save changes
    if (loadedCounter) {
      await repository.save(loadedCounter);
      await unitOfWork.commit();
    }

    // Verify events and snapshot
    expect(eventStore.eventCount).toBe(6);
    expect(snapshotStore.allSnapshots.length).toBe(2); // With our fixed SnapshotStore, we now have 2 snapshots

    //
    // Step 3: Perform additional operations to test snapshots
    //

    // Load counter again - should load from snapshot now
    const counterFromSnapshot = await repository.load<Counter>('counter/lifecycle');

    // Verify loaded state
    expect(counterFromSnapshot).not.toBeNull();
    expect(counterFromSnapshot?.state.value).toBe(15);
    expect(counterFromSnapshot?.revision).toBe(6);

    // Perform more operations to trigger another snapshot
    counterFromSnapshot?.increment(5);
    counterFromSnapshot?.increment(10);
    counterFromSnapshot?.increment(20);
    counterFromSnapshot?.decrement(10);

    // Save changes
    if (counterFromSnapshot) {
      await repository.save(counterFromSnapshot);
      await unitOfWork.commit();
    }

    // Verify events and snapshots
    expect(eventStore.eventCount).toBe(10);
    expect(snapshotStore.allSnapshots.length).toBe(3); // With our fixed implementation, all three saves should create a snapshot

    //
    // Step 4: Final load to verify complete state
    //

    // Load counter one more time
    const finalCounter = await repository.load<Counter>('counter/lifecycle');

    // Verify final state
    expect(finalCounter).not.toBeNull();
    expect(finalCounter?.state.value).toBe(40); // 15 + 5 + 10 + 20 - 10
    expect(finalCounter?.revision).toBe(10);

    // We should be able to reconstruct the complete event history
    const events = eventStore.allEvents;
    expect(events.length).toBe(10);

    const createdEvent = events[0] as any;
    expect(createdEvent.type).toBe('CounterCreated');
    expect(createdEvent.data.initialValue).toBe(10);

    const incrementedEvent = events[1] as any;
    expect(incrementedEvent.type).toBe('CounterIncremented');
    expect(incrementedEvent.data.amount).toBe(5);

    const decrementedEvent = events[9] as any;
    expect(decrementedEvent.type).toBe('CounterDecremented');
    expect(decrementedEvent.data.amount).toBe(10);
  });

  test('should handle loading and applying batch', async () => {
    // Create several counters
    const counter1 = Counter.create('batch1', 10);
    const counter2 = Counter.create('batch2', 20);
    const counter3 = Counter.create('batch3', 30);

    // Modify each counter
    counter1.increment(5);
    counter2.increment(10);
    counter3.increment(15);

    // Save all counters
    await repository.saveBatch([counter1, counter2, counter3]);
    await unitOfWork.commit();

    // Verify events
    expect(eventStore.eventCount).toBe(6); // 3 creations + 3 increments

    // Load all counters in batch
    const loadedCounters = await repository.loadBatch<Counter>([
      'counter/batch1',
      'counter/batch2',
      'counter/batch3'
    ]);

    // Verify all were loaded
    expect(loadedCounters.length).toBe(3);

    // Verify individual states
    expect(loadedCounters[0].state.value).toBe(15); // 10 + 5
    expect(loadedCounters[1].state.value).toBe(30); // 20 + 10
    expect(loadedCounters[2].state.value).toBe(45); // 30 + 15

    // Make more changes
    loadedCounters[0].reset(50);
    loadedCounters[1].decrement(15);
    loadedCounters[2].increment(25);

    // Save batch again
    await repository.saveBatch(loadedCounters.map(c => c as Counter)); // Cast needed if T is just AggregateRoot
    await unitOfWork.commit();

    // Verify new event count
    expect(eventStore.eventCount).toBe(9);

    // Load individual counter to verify changes
    const counter1Reloaded = await repository.load<Counter>('counter/batch1');
    expect(counter1Reloaded?.state.value).toBe(50);

    const counter2Reloaded = await repository.load<Counter>('counter/batch2');
    expect(counter2Reloaded?.state.value).toBe(15); // 30 - 15

    const counter3Reloaded = await repository.load<Counter>('counter/batch3');
    expect(counter3Reloaded?.state.value).toBe(70); // 45 + 25
  });
});
