import { readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { ensureDir } from 'fs-extra';
import prettier from 'prettier';
import type {
  X2jOptionsOptional,
  XmlBuilderOptionsOptional,
} from 'fast-xml-parser';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

import type { Entity } from '../../types';

import type { EntitySerializer } from './EntitySerializer';

export type XmlSerializerOptions = Partial<{
  x2j: XmlBuilderOptionsOptional & { [key: string]: unknown };
  prettier: prettier.Options & { [key: string]: unknown };
}>;

export class XmlSerializer<ID, T extends Entity<ID>>
  implements EntitySerializer<ID, T>
{
  protected readonly builder = new XMLBuilder(this.options.x2j);
  protected readonly parser = new XMLParser(this.options.x2j);

  constructor(
    protected readonly options: XmlSerializerOptions & X2jOptionsOptional,
  ) {}

  protected mapToEntity(raw: unknown): T {
    return raw as T;
  }

  protected mapToSerialized(entity: T): unknown {
    return entity;
  }

  async deserialize(entityPath: string): Promise<T> {
    const contents = await readFile(entityPath, 'utf8');
    const raw = this.parser.parse(contents);
    return this.mapToEntity(raw);
  }

  async serialize(entityPath: string, entity: T): Promise<void> {
    await ensureDir(dirname(entityPath));
    const raw = this.mapToSerialized(entity);
    const contents = this.builder.build(raw);
    const formatted = this.options.prettier
      ? prettier.format(contents, this.options.prettier)
      : contents;
    await writeFile(entityPath, formatted);
  }
}
