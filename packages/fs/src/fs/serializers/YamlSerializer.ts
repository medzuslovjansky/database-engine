import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ensureDir } from 'fs-extra';
import { parse, stringify } from 'yaml';

import type { Entity } from '../../types';

import type { EntitySerializer } from './EntitySerializer';

export class YamlSerializer<ID, T extends Entity<ID>>
  implements EntitySerializer<ID, T>
{
  protected mapToEntity(raw: unknown): T {
    return raw as T;
  }

  protected mapToSerialized(entity: T): unknown {
    return entity;
  }

  async serialize(entityPath: string, entity: T): Promise<void> {
    await ensureDir(path.dirname(entityPath));
    const raw = this.mapToSerialized(entity);
    const contents = stringify(raw);
    await writeFile(entityPath, contents);
  }

  async deserialize(entityPath: string): Promise<T> {
    const contents = await readFile(entityPath, 'utf8');
    const raw = parse(contents);
    return this.mapToEntity(raw);
  }
}
