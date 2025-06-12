import type { D1Database } from '@cloudflare/workers-types';
import {
  AggregateRegistry,
  AggregateRepository
} from '@interslavic/database-engine-eventstore';

import { D1EventStore } from './D1EventStore';
import { D1EventStoreUnitOfWork } from './D1EventStoreUnitOfWork';
import { D1SnapshotStore } from './D1SnapshotStore';
import { D1UnitOfWork } from './D1UnitOfWork';

export interface D1EventStoreRootConfig {
  db: D1Database;
}

export function createD1EventStoreRoot(config: D1EventStoreRootConfig) {
  const { db } = config;
  const eventStore = new D1EventStore({ db });
  const snapshotStore = new D1SnapshotStore({ db });
  const unitOfWork = new D1EventStoreUnitOfWork({
    eventStore,
    snapshotStore,
    d1UnitOfWork: new D1UnitOfWork({ db }),
  });

  const aggregateRegistry = new AggregateRegistry();
  const aggregateRepository = new AggregateRepository({
    aggregateRegistry,
    eventStore,
    unitOfWork,
    snapshotStore,
    shouldSaveSnapshot: (_, events) => events.length > 0,
  })

  return {
    aggregateRegistry,
    aggregateRepository,
  };
}
