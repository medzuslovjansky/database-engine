import type { Language } from '../../constants';
import { Synset } from '../synset';

export class MultilingualSynset {
  public id = 0; // TODO: make it constructable
  public synsets: MultilingualSynset$Synsets = {
    isv: new Synset(),
  };
}

export type MultilingualSynset$Synsets = {
  isv: Synset;
} & Partial<Record<Language, Synset>>;
