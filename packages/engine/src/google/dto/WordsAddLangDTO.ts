import type { ArrayMapped } from '@interslavic/database-engine-google';

export type WordsAddLangRecord = {
  id: string | number;
  isv: string;
  addition: string;
  partOfSpeech: string;
  type: string | number;
  en: string;
  sameInLanguages: string;
  genesis: string;
  ru: string;
  pl: string;
  cs: string;
  de: string;
  csb: string;
  dsb: string;
  hsb: string;
  ia: string;
  es: string;
  pt: string;
  fr: string;
  it: string;
  he: string;
  da: string;
};

export type WordsAddLangDTO = ArrayMapped<WordsAddLangRecord>;
