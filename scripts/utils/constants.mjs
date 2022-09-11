export const CYRL_LANGS = [
  'be',
  'bg',
  'mk',
  'ru',
  'sr',
  'uk',
];

export const LANGS = [
  ...CYRL_LANGS,

  'cs',
  'hr',
  'pl',
  'sk',
  'sl',
];

export const LANGUAGE_NAMES = {
  isv: 'Interslavic',
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

export const SHEET_URLS = {
  new_interslavic_words_list:
    'https://docs.google.com/spreadsheets/d/1N79e_yVHDo-d026HljueuKJlAAdeELAiPzdFzdBuKbY/export',
  rules:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTB2DAu_uRJoHlPx5x_5O7YlsUrbZ89fsHWT7d8bRinQnAWMaYc3rQTwJ_Tt8mLQBXu4pBaKXFIrPdn/pub',
  analysis:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRTuM4wm1tZX7_ZLheTGPyvnMoGYGRbIqNHLfr34lFGoAwhq7wh21hhnr27krjNUMLACtaYLGEC7F0i/pub',
};

export const GIDs = {
  new_interslavic_words_list: {
    words: 1987833874,
  },

  rules: {
    words: 1550049438,
    ru: 38894690,
    be: 138448845,
    uk: 344758669,
    pl: 1767945178,
    sk: 703987862,
    cs: 1613566286,
    sl: 533139772,
    sr: 2009986178,
    hr: 932209977,
    mk: 858766807,
    bg: 1433196376,
  },

  analysis: {
    be: 1255283172,
    bg: 842167821,
    cs: 2049157610,
    hr: 1994073164,
    mk: 1446524003,
    pl: 392567566,
    ru: 178587423,
    sk: 2125328901,
    sl: 1412251584,
    sr: 459290131,
    uk: 2098204280,
  },
};
