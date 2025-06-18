import { beforeAll, afterAll } from 'vitest';
import { Miniflare } from 'miniflare';
import { D1AuthMigrations } from '@auth/d1';

let mf: Miniflare;

beforeAll(async () => {
  mf = new Miniflare({
    scriptPath: require.resolve('./worker.js'),
    modules: true,
    d1Databases: { DB: ':memory:' },
  });
  const db = await mf.getD1Database('DB');

  const migrations = new D1AuthMigrations({ db });
  await migrations.up();

  globalThis.__MINIFLARE_DB__ = db;
});

afterAll(async () => {
  await mf.dispose();
});
