import type { D1Database } from '@cloudflare/workers-types';

import {
  createEventsTable,
  createProjectionCheckpointsTable,
  dropEventsTable,
  dropProjectionCheckpointsTable,
} from './sql';

export async function createEventStoreTables(db: D1Database): Promise<void> {
  await createEventsTable(db);
  await createProjectionCheckpointsTable(db);
}

export async function dropEventStoreTables(db: D1Database): Promise<void> {
  await dropEventsTable(db);
  await dropProjectionCheckpointsTable(db);
}
