import type { InterslavicLemma } from '../lemma';

import { Synset } from './Synset';

export class InterslavicSynset extends Synset<InterslavicLemma> {
  static parse(value: string): InterslavicSynset {
    return Synset.parse(value);
  }
}
