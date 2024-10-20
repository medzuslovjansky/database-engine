import path from 'node:path';

import { ChunkOrganizer } from '../../fs/organizers';

export class MultilingualSynsetOrganizer extends ChunkOrganizer {
  constructor(rootDirectory: string) {
    super(path.join(rootDirectory, 'synsets'), 6, 2);
  }
}
