import { beforeAll, afterAll } from 'vitest';
import { Miniflare } from 'miniflare';
import { D1EventStore, D1SnapshotStore } from './src';

let mf: Miniflare;

beforeAll(async () => {
  mf = new Miniflare({
    scriptPath: require.resolve('./worker.js'),
    modules: true,
    d1Databases: { DB: ':memory:' },
  });
  const db = await mf.getD1Database('DB');

  // Create tables directly using the static methods
  await D1EventStore.createTable(db);
  await D1SnapshotStore.createTable(db);

  globalThis.__MINIFLARE_DB__ = db;
});

afterAll(async () => {
  await mf.dispose();
});
