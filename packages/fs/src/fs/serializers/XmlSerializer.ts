import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ensureDir } from 'fs-extra';
import { format, type Options as PrettierOptions } from 'prettier';
import type {
  X2jOptions,
  XmlBuilderOptions,
} from 'fast-xml-parser';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

import type { Entity } from '../../types';

import type { EntitySerializer } from './EntitySerializer';

export type XmlSerializerOptions = Partial<{
  x2j: XmlBuilderOptions & { [key: string]: unknown };
  prettier: PrettierOptions & { [key: string]: unknown };
}>;

export class XmlSerializer<ID, T extends Entity<ID>>
  implements EntitySerializer<ID, T>
{
  protected readonly builder: XMLBuilder;
  protected readonly parser: XMLParser;

  constructor(
    protected readonly options: XmlSerializerOptions & X2jOptions,
  ) {
    this.builder = new XMLBuilder(this.options.x2j);
    this.parser = new XMLParser(this.options.x2j);
  }

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
    await ensureDir(path.dirname(entityPath));
    const raw = this.mapToSerialized(entity);
    const contents = this.builder.build(raw);
    const formatted = this.options.prettier
      ? format(contents, this.options.prettier)
      : contents;
    await writeFile(entityPath, formatted);
  }
}
