export interface AICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, data: T): Promise<void>;
  clear(): Promise<void>;
}
