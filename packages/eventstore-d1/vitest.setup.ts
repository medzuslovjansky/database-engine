import { beforeAll, afterAll, vi } from 'vitest';
import { Miniflare } from 'miniflare';

import { D1EventStoreMigrations } from './src';

let mf: Miniflare;

beforeAll(async () => {
  mf = new Miniflare({
    scriptPath: require.resolve('./worker.js'),
    modules: true,
    d1Databases: { DB: ':memory:' },
  });
  const db = await mf.getD1Database('DB');

  // Create tables using the migration system
  const logger = {
    runningMigration: vi.fn(),
    rollingBackMigration: vi.fn(),
  };
  const migrations = new D1EventStoreMigrations({ db, logger });
  await migrations.up();

  globalThis.__MINIFLARE_DB__ = db;
});

afterAll(async () => {
  await mf.dispose();
});
