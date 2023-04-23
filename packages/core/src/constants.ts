export const CYRL_LANGS = ['be', 'bg', 'mk', 'ru', 'sr', 'uk'];

export const LANGS = [...CYRL_LANGS, 'cs', 'hr', 'pl', 'sk', 'sl'].sort();

export const NATURAL_LANGUAGES = {
  ru: 'Russian',
  be: 'Belarusian',
  uk: 'Ukrainian',
  pl: 'Polish',
  sk: 'Slovak',
  cs: 'Czech',
  sl: 'Slovenian',
  hr: 'Croatian',
  sr: 'Serbian',
  mk: 'Macedonian',
  bg: 'Bulgarian',
};

export const LANGUAGE_NAMES = {
  isv: 'Interslavic',
  ...NATURAL_LANGUAGES,
};
