import { MultiFileRepository } from '../fs';
import type { Lemma } from '../dto';

import { LemmaOrganizer } from './organizers';
import { LemmaSerializer } from './serialization';

export class LemmasRepository extends MultiFileRepository<number, Lemma> {
  constructor(rootDirectory: string) {
    const fileOrganizer = new LemmaOrganizer(rootDirectory);
    const entitySerializer = new LemmaSerializer();

    super(fileOrganizer, entitySerializer);
  }
}
