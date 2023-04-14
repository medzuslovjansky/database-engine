import { ChunkOrganizer } from '../../fs/organizers';

export class LemmaOrganizer extends ChunkOrganizer {
  constructor(rootDirectory: string) {
    super(rootDirectory, 6, 2);
  }
}
