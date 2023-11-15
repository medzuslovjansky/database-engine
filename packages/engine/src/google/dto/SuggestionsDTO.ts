import type { ArrayMapped } from '@interslavic/database-engine-google';

export type SuggestionsRecord = {
  id: string;
  isv: string;
  addition: string;
  author: string;
  partOfSpeech: string;
  type: string | number;
  en: string;
  tags: string;
  definition: string;
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
  comments: string;
};

export type SuggestionsDTO = ArrayMapped<SuggestionsRecord>;
