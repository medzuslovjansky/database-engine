export const NATURAL_SLAVIC_LANGUAGES = {
  be: 'Belarusian',
  bg: 'Bulgarian',
  bs: 'Bosnian',
  cnr: 'Montenegrin',
  cs: 'Czech',
  csb: 'Kashubian',
  cu: 'Old Church Slavonic',
  dsb: 'Lower Sorbian',
  hr: 'Croatian',
  hsb: 'Upper Sorbian',
  mk: 'Macedonian',
  pl: 'Polish',
  qpm: 'Pomak',
  ru: 'Russian',
  rue: 'Rusyn',
  sk: 'Slovak',
  sl: 'Slovenian',
  sr: 'Serbian',
  szl: 'Silesian',
  uk: 'Ukrainian',
};

export const SLAVIC_LANGUAGES = {
  'art-x-interslv': 'Interslavic',
  ...NATURAL_SLAVIC_LANGUAGES,
};

export const ROMANCE_LANGUAGES = {
  es: 'Spanish',
  fr: 'French',
  ia: 'Interlingua',
  it: 'Italian',
  pt: 'Portuguese',
};

export const GERMANIC_LANGUAGES = {
  da: 'Danish',
  de: 'German',
  en: 'English',
  nl: 'Dutch',
};

export const LANGUAGE_NAMES = {
  ...SLAVIC_LANGUAGES,
  ...GERMANIC_LANGUAGES,
  ...ROMANCE_LANGUAGES,

  eo: 'Esperanto',
  he: 'Hebrew',
};

export type NaturalSlavicLanguage = keyof typeof NATURAL_SLAVIC_LANGUAGES;
export type SlavicLanguage = keyof typeof SLAVIC_LANGUAGES;
export type RomanceLanguage = keyof typeof ROMANCE_LANGUAGES;
export type GermanicLanguage = keyof typeof GERMANIC_LANGUAGES;
export type Language = keyof typeof LANGUAGE_NAMES;

export const NATURAL_SLAVIC_LANGUAGE_CODES = Object.keys(
  NATURAL_SLAVIC_LANGUAGES,
) as NaturalSlavicLanguage[];

export const SLAVIC_LANGUAGE_CODES = Object.keys(
  SLAVIC_LANGUAGES,
) as SlavicLanguage[];

export const ROMANCE_LANGUAGE_CODES = Object.keys(
  ROMANCE_LANGUAGES,
) as RomanceLanguage[];

export const GERMANIC_LANGUAGE_CODES = Object.keys(
  GERMANIC_LANGUAGES,
) as GermanicLanguage[];

export const LANGUAGE_CODES = Object.keys(LANGUAGE_NAMES) as Language[];
