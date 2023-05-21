import type { ArrayMapped } from '@interslavic/database-engine-google';

import type { amends, beta } from '../../symbols';

export type WordsDTO = ArrayMapped<{
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
}> & {
  [amends]?: WordsDTO;
  [beta]?: boolean;
};
