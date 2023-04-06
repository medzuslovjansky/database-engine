import { describe } from 'node:test';

import { Config } from './Config';

describe('Config', () => {
  let config: Config;

  beforeAll(async () => {
    config = new Config('fake_db');
    await config.load();
  });

  it('should load the config', async () => {
    expect(config.config).toMatchSnapshot();
  });

  it('should save the config', async () => {
    await config.save();
  });
});
