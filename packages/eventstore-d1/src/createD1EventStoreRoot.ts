import type { D1Database } from '@cloudflare/workers-types';
import { D1UnitOfWork, type D1MigrationsLogger } from '@interslavic/database-engine-database-d1';
import {
  AggregateRegistry,
  AggregateRepository
} from '@interslavic/database-engine-eventstore';

import { D1EventStore } from './D1EventStore';
import { D1EventStoreUnitOfWork } from './D1EventStoreUnitOfWork';
import { D1SnapshotStore } from './D1SnapshotStore';
import { D1EventStoreMigrations } from './D1EventStoreMigrations';

export interface D1EventStoreRootConfig {
  db: D1Database;
  logger?: D1MigrationsLogger;
}

export function createD1EventStoreRoot(config: D1EventStoreRootConfig) {
  const { db, logger } = config;

  const aggregateRegistry = new AggregateRegistry();
  const eventStore = new D1EventStore({ db });
  const eventStoreMigrations = new D1EventStoreMigrations({ db, logger });
  const snapshotStore = new D1SnapshotStore({
    db,
    aggregateRegistry,
  });
  const unitOfWork = new D1EventStoreUnitOfWork({
    eventStore,
    snapshotStore,
    d1UnitOfWork: new D1UnitOfWork({ db }),
  });

  const aggregateRepository = new AggregateRepository({
    aggregateRegistry,
    eventStore,
    unitOfWork,
    snapshotStore,
    shouldSaveSnapshot: (_, events) => events.length > 0,
  })

  return {
    eventStoreMigrations,
    aggregateRegistry,
    aggregateRepository,
  };
}
