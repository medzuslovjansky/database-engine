import { beforeAll, afterAll } from 'vitest';
import { Miniflare } from 'miniflare';

import { D1AuthMigrations } from './src/d1/migrations';

let mf: Miniflare;

beforeAll(async () => {
  mf = new Miniflare({
    scriptPath: require.resolve('./worker.js'),
    modules: true,
    d1Databases: { DB: ':memory:' },
  });
  const db = await mf.getD1Database('DB');

  // Run migrations to set up the auth tables
  const migrations = new D1AuthMigrations({
    db,
    migrationsTableName: 'migrations'
  });
  await migrations.up();

  globalThis.__MINIFLARE_DB__ = db;
});

afterAll(async () => {
  await mf.dispose();
});
