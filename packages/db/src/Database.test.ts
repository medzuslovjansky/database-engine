import { describe } from 'node:test';

import { Database } from './Database';

describe('Database', () => {
  let database: Database;

  beforeAll(async () => {
    database = new Database('fake_db');
    await database.load();
  });

  it('should load the config', async () => {
    expect(database.config).toMatchSnapshot();
  });

  it('should save the config', async () => {
    await database.save();
  });
});
