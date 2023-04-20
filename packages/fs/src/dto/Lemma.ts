import type { Language } from './misc';

export type Lemma = {
  id: number;
  isv: string[];
  partOfSpeech: string;
  translations: Partial<Record<Language, string[]>>;
  examples?: string[];
  type?: number;
  sameInLanguages?: string;
  genesis?: string;
  frequency?: number;
  intelligibility?: string;
  // metadata: {
  //   translations: TranslationMetadata;
  // };
};

// export type TranslationMetadata = {
//   autotranslated: Set<Language>;
//   debatable: Set<Language>;
// };
//
// export type Intelligibility = {
//   [key in SlavicLanguage]?: IntelligibilityStatus;
// };
//
// export type IntelligibilityStatus = '+' | '~' | '-';
