import { join } from 'node:path';

import { ChunkOrganizer } from '../../fs/organizers';

export class LemmaOrganizer extends ChunkOrganizer {
  constructor(rootDirectory: string) {
    super(join(rootDirectory, 'lemmas'), 6, 2);
  }
}
