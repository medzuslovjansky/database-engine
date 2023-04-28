import type { Language } from '../../constants';
import type { Synset } from '../synset';

export class MultilingualSynset {
  public id?: string;
  public synsets: Partial<Record<Language, Synset>> = {};
}
