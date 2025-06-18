import {afterAll, beforeAll} from 'vitest';
import {Miniflare} from 'miniflare';

let mf: Miniflare;

beforeAll(async () => {
  mf = new Miniflare({
    scriptPath: require.resolve('./worker.js'),
    modules: true,
    d1Databases: { DB: ':memory:' },
  });

  globalThis.__MINIFLARE_DB__ = await mf.getD1Database('DB');
});

afterAll(async () => {
  await mf.dispose();
});
