import type { AsyncView, Entity, Repository, SyncView } from '../types';

export class MultiFileRepository<ID, T extends Entity<ID>>
  implements Repository<ID, T>
{
  get all(): AsyncView<ID, T> {
    throw new Error('Not implemented.');
  }

  get dirty(): SyncView<ID, T> {
    throw new Error('Not implemented.');
  }

  add(_entity: T): void {
    throw new Error('Not implemented.');
  }

  remove(_entity: T): void {
    throw new Error('Not implemented.');
  }

  removeById(_id: ID): void {
    throw new Error('Not implemented.');
  }

  save(): Promise<void> {
    throw new Error('Not implemented.');
  }

  update(_id: ID, _entity: Partial<T>): void {
    throw new Error('Not implemented.');
  }

  upsert(_entity: T): void {
    throw new Error('Not implemented.');
  }
}
