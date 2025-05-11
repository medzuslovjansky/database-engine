import type { D1Database } from '@cloudflare/workers-types';

import { EventBus } from '../core';

import { D1EventStore } from './D1EventStore';
import { D1ProjectionStore } from './D1ProjectionStore';
import { createEventStoreTables, dropEventStoreTables } from './tables';

export interface D1EventStoreRootConfig {
  db: D1Database;
}

export function createD1EventStoreRoot(config: D1EventStoreRootConfig) {
  const { db } = config;
  const eventBus = new EventBus();

  return {
    eventBus,
    eventStore: new D1EventStore({ db, eventBus }),
    projectionStore: new D1ProjectionStore(db),
    createEventStoreTables: () => createEventStoreTables(db),
    dropEventStoreTables: () => dropEventStoreTables(db),
  };
}
