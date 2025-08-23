import type { Lemma, LemmaJSON, LemmaOptions } from './Lemma';

export type InterslavicLemma = Lemma<SteenbergenLemmaMetadata>;

export type InterslavicLemmaJSON = LemmaJSON<SteenbergenLemmaMetadata>;

export type InterslavicLemmaOptions = LemmaOptions<SteenbergenLemmaMetadata>;

export type SteenbergenLemmaMetadata = {
  id: number;
  addition?: string;
  partOfSpeech: string;
  type?: number;
  sameInLanguages?: string;
  genesis?: string;
  frequency?: number;
  using_example?: string;
};
