export interface CacheService {
  /**
   * Get data from cache.
   * @param key - Serializable object or a string.
   * @returns The data from the cache or null if it doesn't exist.
   */
  get<T>(key: unknown): Promise<T | null>;
  /**
   * Set data in cache.
   * @param key - Serializable object or a string.
   * @param data - The data to set in the cache.
   */
  set<T>(key: unknown, data: T): Promise<void>;
  /**
   * Clear cache for a specific key or all keys.
   * @param key - Serializable object or a string.
   */
  clear(key?: unknown): Promise<void>;
}
