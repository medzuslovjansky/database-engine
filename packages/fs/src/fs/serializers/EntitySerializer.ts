import type { Entity } from '../../types';

export interface EntitySerializer<ID, T extends Entity<ID>> {
  serialize(entityPath: string, entity: T): Promise<void>;
  deserialize(entityPath: string): Promise<T>;
}
