import { describe, test, expect, beforeEach } from 'vitest';
import { AggregateRepository, ProjectionRunner, AggregateRegistry } from '../../src';
import {
  InMemoryEventStore,
  InMemorySnapshotStore,
  InMemoryProjectionStore,
  InMemoryUnitOfWork
} from '../memory';
import { Counter, CounterState, CounterSummaryProjection } from '../domain';
import { createFreshAggregateRegistry, createFreshProjectionRegistry } from './test-helpers';

describe('Counter e2e', () => {
  // Setup test infrastructure
  const eventStore = new InMemoryEventStore();
  const snapshotStore = new InMemorySnapshotStore();
  const projectionStore = new InMemoryProjectionStore();
  const unitOfWork = new InMemoryUnitOfWork({ eventStore, snapshotStore });

  let aggregateRegistry: AggregateRegistry;
  let projectionRegistry: import('../../src').ProjectionRegistry;
  let repository: AggregateRepository;
  let projectionRunner: ProjectionRunner;

  beforeEach(() => {
    // Use helpers to create fresh registries for each test
    aggregateRegistry = createFreshAggregateRegistry();
    projectionRegistry = createFreshProjectionRegistry();

    // Register Counter aggregate
    aggregateRegistry.register({
      prefix: 'counter',
      factory: (id, revision, state) => new Counter(id.id, revision, state as CounterState),
    });

    repository = new AggregateRepository({
      aggregateRegistry,
      eventStore,
      snapshotStore,
      unitOfWork,
      shouldSaveSnapshot: () => true,
    });

    // Register CounterSummaryProjection
    const counterSummaryProjection = new CounterSummaryProjection(projectionStore);
    projectionRegistry.register(counterSummaryProjection);

    // Setup projection runner
    projectionRunner = new ProjectionRunner({
      projectionRegistry,
      eventStore,
      projectionStore,
      logger: {
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
    });
  });

  test('should create counter, increment, decrement, and project summary', async () => {
    // Create counters
    const counter1 = Counter.create('1', 100);
    const counter2 = Counter.create('2', 20);
    counter1.increment(20);
    counter2.decrement(5);

    // Save counters
    await repository.save(counter1);
    await repository.save(counter2);
    await unitOfWork.commit();

    // Run projections
    await projectionRunner.run();

    // Verify projection state
    const summary = projectionRegistry.get('counterSummary') as CounterSummaryProjection;
    expect(summary.state.totalCounters).toBe(2);
    expect(summary.state.totalValue).toBe(100 + 20 - 5 + 20); // 135
    expect(summary.state.counters['1']).toBe(120);
    expect(summary.state.counters['2']).toBe(15);

    // Load and verify aggregates
    const loadedCounter1 = await repository.load<Counter>('counter/1');
    const loadedCounter2 = await repository.load<Counter>('counter/2');

    // Should throw AggregateNotFoundError for non-existent counter
    await expect(repository.load<Counter>('counter/3')).rejects.toThrow('Aggregate not found');

    expect(loadedCounter1?.state.value).toBe(120);
    expect(loadedCounter2?.state.value).toBe(15);

    // Further operations
    loadedCounter1?.increment(50);
    loadedCounter2?.decrement(10);

    await repository.save(loadedCounter1!); // Non-null assertion as we expect it to exist
    await repository.save(loadedCounter2!);
    await unitOfWork.commit();
    await projectionRunner.run();

    expect(summary.state.totalValue).toBe(120 + 50 + (15 - 10)); // 170 + 5 = 175
    expect(summary.state.counters['1']).toBe(170);
    expect(summary.state.counters['2']).toBe(5);
  });

  test('should handle snapshots correctly', async () => {
    const counterSnap = Counter.create('snapshot-test', 100);
    await repository.save(counterSnap);
    await unitOfWork.commit(); // revision 1

    const loadedCounter = await repository.load<Counter>('counter/snapshot-test');
    expect(loadedCounter?.state.value).toBe(100);
    expect(loadedCounter?.revision).toBe(1);

    loadedCounter?.increment(50); // rev 2
    loadedCounter?.decrement(25); // rev 3
    await repository.save(loadedCounter!);
    await unitOfWork.commit();

    // Run projections (not strictly necessary for snapshot test but good practice)
    await projectionRunner.run();

    const reloadedCounter = await repository.load<Counter>('counter/snapshot-test');
    expect(reloadedCounter?.state.value).toBe(100 + 50 - 25); // 125
    expect(reloadedCounter?.revision).toBe(3);
  });

  test('should reset projection correctly', async () => {
    // Clear everything for a fresh start
    eventStore.clear();
    snapshotStore.clear();
    projectionStore.clear(); // Use the store directly for clearing projection positions

    // Create fresh counters for this test
    const counter1 = Counter.create('reset-test-1', 10);
    const counter2 = Counter.create('reset-test-2', 20);
    await repository.save(counter1);
    await repository.save(counter2);
    await unitOfWork.commit();

    // First run of projections
    await projectionRunner.run();

    // Verify initial state
    const projection = projectionRegistry.get('counterSummary') as CounterSummaryProjection;
    expect(projection.state.totalCounters).toBe(2);
    expect(projection.state.totalValue).toBe(30);

    // Reset projection with a complete rebuild approach
    // First reset the projection itself (both in-memory state and stored position)
    await projection.reset();

    // Re-run projections from scratch
    await projectionRunner.run();

    // Verify state after reset and reprocessing
    expect(projection.state.totalCounters).toBe(2);
    expect(projection.state.totalValue).toBe(30);

    // Add more events and verify that projection continues correctly
    const counter3 = Counter.create('reset-test-3', 5);
    await repository.save(counter3);
    await unitOfWork.commit();
    await projectionRunner.run();

    expect(projection.state.totalCounters).toBe(3);
    expect(projection.state.totalValue).toBe(35);
  });
});
