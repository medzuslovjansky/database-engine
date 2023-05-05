import type { Language } from '../../constants';
import type { InterslavicSynset, Synset } from '../synset';

export class MultilingualSynset {
  public id = 0; // TODO: make it constructable
  public synsets: MultilingualSynset$Synsets = {
    isv: undefined,
    en: undefined,
    be: undefined,
    bg: undefined,
    bs: undefined,
    cnr: undefined,
    cs: undefined,
    csb: undefined,
    cu: undefined,
    dsb: undefined,
    eo: undefined,
    es: undefined,
    fr: undefined,
    he: undefined,
    hr: undefined,
    hsb: undefined,
    ia: undefined,
    it: undefined,
    mk: undefined,
    nl: undefined,
    pl: undefined,
    pt: undefined,
    qpm: undefined,
    ru: undefined,
    rue: undefined,
    sk: undefined,
    sl: undefined,
    sr: undefined,
    szl: undefined,
    uk: undefined,
    da: undefined,
    de: undefined,
  };
}

export type MultilingualSynset$Synsets = {
  isv?: InterslavicSynset;
} & Partial<Record<Language, Synset | undefined>>;
