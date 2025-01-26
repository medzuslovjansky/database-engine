import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createHash } from 'node:crypto';

import type { Logger } from '@interslavic/database-engine-core';

import { CacheService } from '../types';

interface CachedResponse<T> {
  data: T;
  timestamp: string;
}

export interface FileCacheConfig {
  cacheDir: string;
  logger: Logger;
}

export class FileCache implements CacheService {
  private readonly cacheDir: string;
  private readonly logger: Logger;

  constructor(config: FileCacheConfig) {
    this.cacheDir = config.cacheDir;
    this.logger = config.logger;
  }

  private async ensureCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (err) {
      console.error(`Failed to create cache directory at ${this.cacheDir}:`, err);
      throw err;
    }
  }

  private computeHash(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  private getCacheFilePath(key: unknown): string {
    const keyString = typeof key === 'string' ? key : JSON.stringify(key);
    return path.join(this.cacheDir, `${this.computeHash(keyString)}.json`);
  }

  async get<T>(key: unknown): Promise<T | null> {
    const cacheFilePath = this.getCacheFilePath(key);

    try {
      const data = await fs.readFile(cacheFilePath, 'utf-8');
      const cachedResponse: CachedResponse<T> = JSON.parse(data);
      this.logger.debug({ data }, `AI cache hit (%j):\n%s`, key, data);
      return cachedResponse.data;
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        this.logger.warn(err, `Error reading AI cache file: %s`, cacheFilePath);
      }

      return null;
    }
  }

  async set<T>(key: unknown, data: T): Promise<void> {
    await this.ensureCacheDir();

    const cacheFilePath = this.getCacheFilePath(key);
    const cachedResponse: CachedResponse<T> = {
      data,
      timestamp: new Date().toISOString(),
    };

    try {
      const serializedData = JSON.stringify(cachedResponse);
      this.logger.trace('Writing AI cache file: %s', cacheFilePath);
      await fs.writeFile(cacheFilePath, serializedData, 'utf-8');
    } catch (err) {
      this.logger.warn(err, `Failed to write AI cache file: %s`, cacheFilePath);
    }
  }

  async clear(key?: unknown): Promise<void> {
    const cacheFilePath = key ? this.getCacheFilePath(key) : this.cacheDir;
    try {
      await fs.rm(cacheFilePath, { recursive: true, force: true });
    } catch (err) {
      this.logger.warn(err, `Failed to clear AI cache: %j`, key);
    }
  }
}
