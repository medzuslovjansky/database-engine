import type { MultilingualSynset } from '@interslavic/database-engine-core';

import { MultiFileRepository } from '../fs';

import { MultilingualSynsetOrganizer } from './organizers';
import { MultilingualSynsetSerializer } from './serialization';

export class MultilingualSynsetRepository extends MultiFileRepository<
  number,
  MultilingualSynset
> {
  constructor(rootDirectory: string) {
    const fileOrganizer = new MultilingualSynsetOrganizer(rootDirectory);
    const entitySerializer = new MultilingualSynsetSerializer();

    super(fileOrganizer, entitySerializer);
  }
}
