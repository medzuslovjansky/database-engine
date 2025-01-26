import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { FileCache, FileCacheConfig } from './FileCache';
import { Logger } from '@interslavic/database-engine-core';

describe('FileAICache', () => {
  let cache: FileCache;
  let tempDir: string;
  const logger: Logger = {
    debug: jest.fn(),
    warn: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  };

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(__dirname, 'cache-'));
    const config: FileCacheConfig = {
      cacheDir: tempDir,
      logger: logger,
    };
    cache = new FileCache(config);
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should cache and retrieve data', async () => {
    const key = 'test-key';
    const data = { value: 'test-data' };

    await cache.set(key, data);
    const cachedData = await cache.get<typeof data>(key);

    expect(cachedData).toEqual(data);
  });

  it('should return null for non-existent cache', async () => {
    const cachedData = await cache.get('non-existent-key');
    expect(cachedData).toBeNull();
  });

  it('should clear the cache', async () => {
    const key = 'test-key';
    const data = { value: 'test-data' };

    await cache.set(key, data);
    await cache.clear(key);

    const cachedData = await cache.get<typeof data>(key);
    expect(cachedData).toBeNull();
  });

  it('should log debug message on cache hit', async () => {
    const key = 'test-key';
    const data = { value: 'test-data' };

    await cache.set(key, data);
    await cache.get<typeof data>(key);

    expect(logger.debug).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(String) }),
      expect.stringContaining('AI cache hit'),
      key,
      expect.any(String)
    );
  });

  it('should log warn message on cache read error', async () => {
    const key = 'non-existent-key';

    await cache.get(key);

    expect(logger.warn).not.toHaveBeenCalled(); // No warning for non-existent file
  });
});
