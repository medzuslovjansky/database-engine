import type { ArrayMapped } from '@interslavic/database-engine-google';

export type WordsRecord = {
  id: string | number;
  isv: string;
  addition: string;
  partOfSpeech: string;
  type: string | number;
  en: string;
  sameInLanguages: string;
  genesis: string;
  ru: string;
  be: string;
  uk: string;
  pl: string;
  cs: string;
  sk: string;
  bg: string;
  mk: string;
  sr: string;
  hr: string;
  sl: string;
  cu: string;
  de: string;
  nl: string;
  eo: string;
  frequency: string | number;
  intelligibility: string;
  using_example: string;
};

export type WordsDTO = ArrayMapped<WordsRecord>;
