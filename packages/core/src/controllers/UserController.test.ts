import { UserAggregate } from '@core/aggregates';
import {
  AggregateRepository,
  AggregateRegistry,
} from '@interslavic/database-engine-eventstore';
import {
  InMemoryEventStore,
  InMemorySnapshotStore,
  InMemoryUnitOfWork,
} from '@interslavic/database-engine-eventstore-memory';

import { UserController } from './UserController';

describe('UserController', () => {
  let userController: UserController;
  let aggregateRepository: AggregateRepository;
  let eventStore: InMemoryEventStore;
  let snapshotStore: InMemorySnapshotStore;
  let unitOfWork: InMemoryUnitOfWork;

  const userId = 'test-user-id';
  const issuerId = 'admin-id';

  beforeEach(async () => {
    // 1. Set up the real in-memory infrastructure
    eventStore = new InMemoryEventStore();
    snapshotStore = new InMemorySnapshotStore();
    unitOfWork = new InMemoryUnitOfWork({ eventStore, snapshotStore });
    const aggregateRegistry = new AggregateRegistry();

    aggregateRegistry.register({
      prefix: 'users',
      constructor: UserAggregate,
    });

    aggregateRepository = new AggregateRepository({
      aggregateRegistry,
      eventStore,
      snapshotStore,
      unitOfWork,
      shouldSaveSnapshot: () => false, // Explicitly disable snapshots for this test
    });

    // 2. Create the controller with the real (in-memory) repository
    userController = new UserController({
      aggregateRepository,
      unitOfWork,
    });

    // 3. Create and save the initial user
    const initialUser = UserAggregate.create(userId);
    await aggregateRepository.save(initialUser);
  });

  it('assignRole should persist the new role in the event store', async () => {
    await userController.assignRole({
      userId,
      issuerId,
      role: 'editor',
      language: 'isv',
    });

    // Assert: Load the user from the store again and check its state
    const updatedUser = await aggregateRepository.load<UserAggregate>(
      `users/${userId}`,
    );

    expect(updatedUser).not.toBeNull();
    expect(updatedUser!.hasRole('editor', 'isv')).toBe(true);
    expect(eventStore.eventCount).toBe(2); // UserCreated, RoleAssigned
  });
});
