import path from 'node:path';

import type { MultilingualSynset } from '@interslavic/database-engine-core';

import { MultiFileRepository } from '../fs';

import { MultilingualSynsetOrganizer } from './organizers';
import type { MultilingualSynsetSerializerOptions } from './serialization';
import { MultilingualSynsetSerializer } from './serialization';

export type MultilingualSynsetRepositoryOptions = {
  rootDirectory: string;
  prettier?: MultilingualSynsetSerializerOptions['prettier'];
};

export class MultilingualSynsetRepository extends MultiFileRepository<
  number,
  MultilingualSynset
> {
  constructor(options: MultilingualSynsetRepositoryOptions) {
    const fileOrganizer = new MultilingualSynsetOrganizer(
      options.rootDirectory,
    );
    const entitySerializer = new MultilingualSynsetSerializer({
      prettier: options.prettier,
    });

    super(fileOrganizer, entitySerializer);
  }

  async deduceId(filePath: string): Promise<number | undefined> {
    return filePath.endsWith('.xml')
      ? this.fileOrganizer.deduceId(path.dirname(filePath))
      : this.fileOrganizer.deduceId(filePath);
  }
}
