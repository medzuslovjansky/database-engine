import * as fse from 'fs-extra';
import { globby } from 'globby';
import _ from 'lodash';

import type { Entity, Repository } from '../types';

import type { FileOrganizer } from './organizers';
import type { EntitySerializer } from './serializers';

export class MultiFileRepository<ID, T extends Entity<ID>>
  implements Repository<ID, T>
{
  constructor(
    protected readonly fileOrganizer: FileOrganizer<ID>,
    protected readonly entitySerializer: EntitySerializer<ID, T>,
  ) {}

  async delete<HasID extends Pick<T, 'id'>>(entity: HasID): Promise<void> {
    await this.deleteById(entity.id);
  }

  async deleteById(id: ID): Promise<void> {
    const entityPath = this.fileOrganizer.buildPath(id);
    await fse.remove(entityPath);
  }

  async filter(predicate: (entity: T) => boolean): Promise<T[]> {
    const results: T[] = [];

    await this._forEachPath(async (entityPath) => {
      const entity = await this.entitySerializer.deserialize(entityPath);

      if (predicate(entity)) {
        results.push(entity);
      }
    });

    return results;
  }

  async find(predicate: (entity: T) => boolean): Promise<T | undefined> {
    const results = await this.filter(predicate);
    return results[0];
  }

  async findById(id: ID): Promise<T | undefined> {
    if (await this.hasId(id)) {
      const entityPath = this.fileOrganizer.buildPath(id);
      return this.entitySerializer.deserialize(entityPath);
    }

    return;
  }

  async forEach(visitor: (entity: T) => void | Promise<void>): Promise<void> {
    await this._forEachPath(async (entityPath) => {
      const entity = await this.entitySerializer.deserialize(entityPath);
      await visitor(entity);
      await this.entitySerializer.serialize(entityPath, entity);
    });
  }

  async hasId(id: ID): Promise<boolean> {
    const entityPath = this.fileOrganizer.buildPath(id);
    return fse.pathExists(entityPath);
  }

  async deduceId(filePath: string): Promise<ID | undefined> {
    return this.fileOrganizer.deduceId(filePath);
  }

  async insert(entity: T): Promise<void> {
    if (await this.hasId(entity.id)) {
      throw new Error(`Entity with id ${entity.id} already exists.`);
    }

    await this.upsert(entity);
  }

  async keys(): Promise<ID[]> {
    const globPatterns = this.fileOrganizer.getPatterns();
    const foundPaths = await globby(globPatterns, { onlyFiles: false });
    return foundPaths.map((p) => this.fileOrganizer.deduceId(p));
  }

  async size(): Promise<number> {
    const globPatterns = this.fileOrganizer.getPatterns();
    const foundPaths = await globby(globPatterns, { onlyFiles: false });
    return foundPaths.length;
  }

  async update(id: ID, entity: Partial<T>): Promise<T | undefined> {
    const existing = await this.findById(id);

    if (existing) {
      const updated = _.merge({}, existing, entity);
      await this.upsert(updated);
      return updated;
    }

    return;
  }

  upsert(entity: T): Promise<void> {
    const entityPath = this.fileOrganizer.buildPath(entity.id);
    return this.entitySerializer.serialize(entityPath, entity);
  }

  async values(): Promise<T[]> {
    const globPatterns = this.fileOrganizer.getPatterns();
    const foundPaths = await globby(globPatterns, { onlyFiles: false });

    return await Promise.all(
      foundPaths.map((p) => this.entitySerializer.deserialize(p)),
    );
  }

  private async _forEachPath(
    callback: (entityPath: string) => Promise<void>,
  ): Promise<void> {
    const globPatterns = this.fileOrganizer.getPatterns();
    const allPaths = await globby(globPatterns, { onlyFiles: false });

    await Promise.all(allPaths.map(callback));
  }
}
