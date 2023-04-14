import { describe } from 'node:test';

import { Database } from './Database';

describe('Database', () => {
  let database: Database;

  beforeAll(async () => {
    database = new Database('fake_db');
  });

  it('should load the config', async () => {
    const lemmas = await database.lemmas.values();
    expect(lemmas.length).toBeGreaterThan(0);
  });
});
