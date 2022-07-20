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
    'https://docs.google.com/spreadsheets/d/1MLNRRfQHFnCeaqZO04tw0I2JCcz-zeAsk6QLNll4Up8/export?format=csv',
  rules:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTB2DAu_uRJoHlPx5x_5O7YlsUrbZ89fsHWT7d8bRinQnAWMaYc3rQTwJ_Tt8mLQBXu4pBaKXFIrPdn/pub?output=csv',
  analysis:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRTuM4wm1tZX7_ZLheTGPyvnMoGYGRbIqNHLfr34lFGoAwhq7wh21hhnr27krjNUMLACtaYLGEC7F0i/pub?output=csv',
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
    be: 1289058313,
    bg: 1862882922,
    cs: 1605993183,
    hr: 892674272,
    mk: 290266011,
    pl: 392567566,
    ru: 554192232,
    sk: 38247542,
    sl: 1618253687,
    sr: 797342275,
    uk: 263712639,
  },
};
