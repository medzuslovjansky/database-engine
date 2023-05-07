import fs from 'node:fs';
import { basename, dirname } from 'node:path';

import * as csv from 'csv';
import type { Parser } from 'csv-parse';
import { ensureDir } from 'fs-extra';

import type { Entity, EntityCollection } from '../../types';

import type { EntitySerializer } from './EntitySerializer';

export type ParseFileOptions = {
  delimiter?: string;
  silent?: boolean;
};

export class CsvSerializer<ID, T extends Entity<ID>>
  implements EntitySerializer<string, EntityCollection<ID, T>>
{
  constructor(protected readonly parseOptions: ParseFileOptions = {}) {}

  protected mapToEntity(raw: unknown): T {
    return raw as T;
  }

  protected mapToSerialized(entity: T): unknown {
    return entity;
  }

  async serialize(
    collectionPath: string,
    collection: EntityCollection<ID, T>,
  ): Promise<void> {
    await ensureDir(dirname(collectionPath));

    const raw = collection.items.map((item) => this.mapToSerialized(item));
    await new Promise((resolve, reject) => {
      const filestream = fs.createWriteStream(collectionPath);
      filestream.on('error', reject);
      filestream.on('close', resolve);
      csv
        .stringify(raw, {
          header: true,
        })
        .pipe(filestream);
    });
  }

  async deserialize(collectionPath: string): Promise<EntityCollection<ID, T>> {
    const raw = await parseFile(collectionPath, this.parseOptions);
    const items = raw.map((item) => this.mapToEntity(item));

    return {
      id: basename(collectionPath, '.csv'),
      items,
    };
  }
}

export async function parseFile(
  filePath: string,
  options: ParseFileOptions = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<unknown[]> {
  const { delimiter = ',', silent = false } = options;
  if (silent && !fs.existsSync(filePath)) {
    return [];
  }

  const raw = await new Promise<unknown[]>((resolve, reject) => {
    const records: Record<string, unknown>[] = [];
    const parser = csv.parse({
      columns: true,
      delimiter,
    });

    fs.createReadStream(filePath)
      .on('error', reject)
      .pipe(
        parser
          .on('error', reject)
          .on('readable', _readRecords.bind(parser, records))
          .on('end', () => resolve(records)),
      );
  });

  return raw;
}

function _readRecords(this: Parser, records: Record<string, unknown>[]) {
  let record;
  while ((record = this.read()) !== null) {
    records.push(record);
  }
}
