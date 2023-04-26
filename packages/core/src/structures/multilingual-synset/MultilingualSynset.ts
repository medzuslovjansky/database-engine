import type { Language } from '../../constants';
import type { Synset } from '../synset';

import type { SteenbergenMetadata } from './SteenbergenMetadata';

export class MultilingualSynset {
  public id?: string;
  public synsets: Partial<Record<Language, Synset>> = {};
  public metadata?: SteenbergenMetadata;
}
