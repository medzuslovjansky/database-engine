import type { core, types } from '@interslavic/steen-utils';

export type Raw<T> = Record<keyof T, string>;

export type TranslationsRecord = {
  id: string;
  isv: core.Synset;
  addition: string;
  partOfSpeech: types.PartOfSpeech;
  type: types.VoteStatus;
  sameInLanguages: unknown;
  genesis: types.Genesis;
  frequency: number;
  en: core.Synset;
  ru: core.Synset;
  be: core.Synset;
  uk: core.Synset;
  pl: core.Synset;
  cs: core.Synset;
  sk: core.Synset;
  bg: core.Synset;
  mk: core.Synset;
  sr: core.Synset;
  hr: core.Synset;
  sl: core.Synset;
  cu: core.Synset;
  de: core.Synset;
  nl: core.Synset;
  eo: core.Synset;
  intelligibility: core.IntelligibilityReport;
  using_example: string;
};

export type TranslationRecord = {
  id: string;
  isv: core.Synset;
  addition: string;
  partOfSpeech: types.PartOfSpeech;
  type: types.VoteStatus;
  sameInLanguages: unknown;
  genesis: types.Genesis;
  frequency: number;
  en: core.Synset;
  ru: core.Synset;
  be: core.Synset;
  uk: core.Synset;
  pl: core.Synset;
  cs: core.Synset;
  sk: core.Synset;
  bg: core.Synset;
  mk: core.Synset;
  sr: core.Synset;
  hr: core.Synset;
  sl: core.Synset;
  cu: core.Synset;
  de: core.Synset;
  nl: core.Synset;
  eo: core.Synset;
  intelligibility: core.IntelligibilityReport;
  using_example: string;
};

export type FlavorizationRecord = {
  id: string;
  isv: core.Synset;
  addition: string;
  partOfSpeech: PartOfSpeech;
  frequency: number;
  en: core.Synset;
  ru: core.Synset;
  be: core.Synset;
  uk: core.Synset;
  pl: core.Synset;
  cs: core.Synset;
  sk: core.Synset;
  bg: core.Synset;
  mk: core.Synset;
  sr: core.Synset;
  hr: core.Synset;
  sl: core.Synset;
};

export type AnalysisRecord = {
  id: string;
  isv: core.Synset;
  translationOriginal: core.Synset;
  translationCorrection: core.Synset;
  translationMatch: core.Synset;
  helperWords: core.Synset;
  falseFriends: core.Synset;
};
