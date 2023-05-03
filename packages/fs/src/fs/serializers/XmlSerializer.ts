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

export type XmlSerializerOptions = XmlBuilderOptionsOptional & {
  [key: string]: unknown;
};

export class XmlSerializer<ID, T extends Entity<ID>>
  implements EntitySerializer<ID, T>
{
  protected readonly builder = new XMLBuilder(this.options);
  protected readonly parser = new XMLParser(this.options);

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
    // TODO: use .prettierc from the database root
    const formatted = prettier.format(contents, {
      parser: 'xml',
      tabWidth: 2,
      // @ts-expect-error TS2345
      xmlWhitespaceSensitivity: 'ignore',
    });
    await writeFile(entityPath, formatted);
  }
}
