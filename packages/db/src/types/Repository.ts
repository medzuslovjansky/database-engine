import type { Entity } from './Entity';
import type { AsyncView, SyncView } from './View';

export interface Repository<ID, T extends Entity<ID>> {
  readonly all: AsyncView<ID, T>;
  readonly dirty: SyncView<ID, T>;

  add(entity: T): void;
  upsert(entity: T): void;
  update(id: ID, entity: Partial<T>): void;
  remove(entity: T): void;
  removeById(id: ID): void;

  save(): Promise<void>;
}
