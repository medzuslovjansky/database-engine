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

export const SHEET_IDs = {
  new_interslavic_words_list: '1N79e_yVHDo-d026HljueuKJlAAdeELAiPzdFzdBuKbY',
  interslavic_intelligibility: '1wXjUu15x6hSpDzDUbLVUwLgDua2DyXs-xjpxGJvFCno',
};

export const SHEET_URLS = {
  new_interslavic_words_list:
    'https://docs.google.com/spreadsheets/d/1N79e_yVHDo-d026HljueuKJlAAdeELAiPzdFzdBuKbY/export',
  rules:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTB2DAu_uRJoHlPx5x_5O7YlsUrbZ89fsHWT7d8bRinQnAWMaYc3rQTwJ_Tt8mLQBXu4pBaKXFIrPdn/pub',
  analysis:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCSgiYViBBD8M6lG1vtUUmjqGQV099QTNafaWA62DHAuX8ApLqg_Zuv-PWlmC2UDd51hb7dlxlpUhV/pub',
};

export const GIDs = {
  translations: [SHEET_URLS.new_interslavic_words_list, 1987833874],
  flavorizations: [SHEET_URLS.analysis, 1265463098],
  be: [SHEET_URLS.analysis, 1255283172],
  bg: [SHEET_URLS.analysis, 842167821],
  cs: [SHEET_URLS.analysis, 2049157610],
  hr: [SHEET_URLS.analysis, 1994073164],
  mk: [SHEET_URLS.analysis, 1446524003],
  pl: [SHEET_URLS.analysis, 392567566],
  ru: [SHEET_URLS.analysis, 178587423],
  sk: [SHEET_URLS.analysis, 2125328901],
  sl: [SHEET_URLS.analysis, 1412251584],
  sr: [SHEET_URLS.analysis, 459290131],
  uk: [SHEET_URLS.analysis, 2098204280],
};
