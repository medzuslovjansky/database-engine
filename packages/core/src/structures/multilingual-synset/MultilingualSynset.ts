import type { Language } from '@core/constants';
import { areSetsEqual } from '@core/utils';

import { Synset, SynsetJSON } from '../synset';

export type MultilingualSynsetJSON = {
  id?: number;
  beta?: boolean;
  synsets?: Partial<Record<string, SynsetJSON | undefined>>;
  steen?: { debated?: Array<DebatedFields> };
  intelligibility?: string;
};

export class MultilingualSynset {
  public id = 0; // TODO: make it constructable
  public beta = false;
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
  public steen?: MultilingualSynset$Steen;

  public toJSON(): MultilingualSynsetJSON {
    return {
      id: Math.abs(this.id),
      beta: this.id < 0,
      synsets: Object.fromEntries(
        Object.entries(this.synsets)
          .filter(([, v]) => v !== undefined)
          .map(([lang, synset]) => [
            lang,
            synset && typeof synset.toJSON === 'function' ? synset.toJSON() : undefined,
          ])
      ),
      steen: this.steen
        ? {
            debated: this.steen.debated ? Array.from(this.steen.debated) : undefined,
          }
        : undefined,
    };
  }

  public static fromJSON(json: Readonly<MultilingualSynsetJSON>): MultilingualSynset {
    const instance = new MultilingualSynset();

    if (typeof json.id === 'number') {
      instance.id = Math.abs(json.id);
      instance.beta = instance.id < 0;
    }

    if (typeof json.beta === 'boolean') {
      instance.beta = json.beta;
    }

    if (json.synsets) {
      for (const [lang, synset] of Object.entries(json.synsets)) {
        if (synset) {
          instance.synsets[lang as Language] = Synset.fromJSON(synset as SynsetJSON);
        }
      }
    }

    if (json.steen) {
      instance.steen = {
        debated: json.steen.debated ? new Set(json.steen.debated) as MultilingualSynset$Steen['debated'] : undefined,
      };
    }

    return instance;
  }

  public equals(other: MultilingualSynset): boolean {
    if (this.id !== other.id) return false;
    if (this.beta !== other.beta) return false;
    if (this.steen?.debated?.size !== other.steen?.debated?.size) return false;
    if (!areSetsEqual(this.steen?.debated, other.steen?.debated)) return false;

    const keysA = new Set(Object.keys(this.synsets));
    const keysB = new Set(Object.keys(other.synsets));
    if (!areSetsEqual(keysA, keysB)) return false;
    for (const lang of keysA) {
      const a = this.synsets[lang as Language] as Synset | undefined;
      const b = other.synsets[lang as Language] as Synset | undefined;
      if (!a && !b) continue;
      if (!a || !b) return false;
      if (!a.equals(b)) return false;
    }

    return true;
  }
}

export type MultilingualSynset$Synsets = Partial<Record<Language, Synset | undefined>>;

type DebatedFields =
    | 'id'
    | 'isv'
    | 'addition'
    | 'partOfSpeech'
    | 'type'
    | 'sameInLanguages'
    | 'genesis'
    | 'frequency'
    | 'en'
    | 'ru'
    | 'be'
    | 'uk'
    | 'pl'
    | 'cs'
    | 'sk'
    | 'bg'
    | 'mk'
    | 'sr'
    | 'hr'
    | 'sl'
    | 'cu'
    | 'de'
    | 'nl'
    | 'eo'
    | 'intelligibility'
    | 'using_example';

export type MultilingualSynset$Steen = {
  debated?: Set<DebatedFields>;
};
