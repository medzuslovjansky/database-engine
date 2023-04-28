import type { Language } from '../../constants';
import type { Synset } from '../synset';

import type { SteenbergenMetadata } from '../lemma/SteenbergenMetadata';

export class MultilingualSynset {
  public id?: string;
  public synsets: Partial<Record<Language, Synset>> = {};
}
