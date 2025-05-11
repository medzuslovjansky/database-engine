import { beforeAll, afterAll } from 'vitest';
import { Miniflare } from 'miniflare';

let mf: Miniflare;

beforeAll(async () => {
  mf = new Miniflare({
    scriptPath: require.resolve('./worker.js'),
    modules: true,
    d1Databases: { DB: ':memory:' },
  });
  const db = await mf.getD1Database('DB');
  const { createEventStoreTables } = await import('./src/d1');
  await createEventStoreTables(db);
  globalThis.__MINIFLARE_DB__ = db;
});

afterAll(async () => {
  await mf.dispose();
});
