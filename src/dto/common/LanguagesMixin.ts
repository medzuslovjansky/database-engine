export type LanguagesMixin = {
  en?: string;
  ru?: string;
  be?: string;
  uk?: string;
  pl?: string;
  cs?: string;
  sk?: string;
  bg?: string;
  mk?: string;
  sr?: string;
  hr?: string;
  sl?: string;
  cu?: string;
  de?: string;
  nl?: string;
  eo?: string;
};

export type LanguageKey = keyof LanguagesMixin;

export const LANGUAGES = Object.keys({
  en: null,
  ru: null,
  be: null,
  uk: null,
  pl: null,
  cs: null,
  sk: null,
  bg: null,
  mk: null,
  sr: null,
  hr: null,
  sl: null,
  cu: null,
  de: null,
  nl: null,
  eo: null,
} as Record<LanguageKey, null>) as LanguageKey[];
