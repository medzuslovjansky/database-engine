import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AICache } from '../types/AICache';

interface CachedResponse<T> {
  data: T;
  timestamp: string;
}

export class FileAICache implements AICache {
  private cacheDir: string;

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
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

  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${this.computeHash(key)}.json`);
  }

  async get<T>(key: string): Promise<T | null> {
    const cacheFilePath = this.getCacheFilePath(key);

    try {
      const data = await fs.readFile(cacheFilePath, 'utf-8');
      const cachedResponse: CachedResponse<T> = JSON.parse(data);
      return cachedResponse.data;
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.warn(`Error reading cache file ${cacheFilePath}:`, err);
      }
      return null;
    }
  }

  async set<T>(key: string, data: T): Promise<void> {
    await this.ensureCacheDir();

    const cacheFilePath = this.getCacheFilePath(key);
    const cachedResponse: CachedResponse<T> = {
      data,
      timestamp: new Date().toISOString(),
    };

    try {
      const serializedData = JSON.stringify(cachedResponse);
      await fs.writeFile(cacheFilePath, serializedData, 'utf-8');
    } catch (err) {
      console.warn(`Failed to write cache file ${cacheFilePath}:`, err);
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
      await this.ensureCacheDir();
    } catch (err) {
      console.warn(`Failed to clear cache directory ${this.cacheDir}:`, err);
    }
  }
}
