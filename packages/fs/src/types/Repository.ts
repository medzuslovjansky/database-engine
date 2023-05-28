import type { Entity } from './Entity';

export interface Repository<ID, T extends Entity<ID>> {
  /* Read operations */
  filter(predicate: (entity: T) => boolean): Promise<T[]>;
  find(predicate: (entity: T) => boolean): Promise<T | undefined>;
  findById(id: ID): Promise<T | undefined>;
  hasId(id: ID): Promise<boolean>;
  deduceId(filePath: string): Promise<ID | undefined>;
  keys(): Promise<ID[]>;
  values(): Promise<T[]>;
  size(): Promise<number>;

  /* Write operations */
  insert(entity: T): Promise<void>;
  upsert(entity: T): Promise<void>;
  update(id: ID, entity: Partial<T>): Promise<T | undefined>;
  forEach(visitor: (entity: T) => void | Promise<void>): Promise<void>;
  delete(entity: T): Promise<void>;
  deleteById(id: ID): Promise<void>;
}
