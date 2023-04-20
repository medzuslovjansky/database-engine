export const CYRL_LANGS = ['be', 'bg', 'mk', 'ru', 'sr', 'uk'];

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

export const SHEET_IDs = {
  new_interslavic_words_list: '1N79e_yVHDo-d026HljueuKJlAAdeELAiPzdFzdBuKbY',
  interslavic_intelligibility: '1wXjUu15x6hSpDzDUbLVUwLgDua2DyXs-xjpxGJvFCno',
  test_sheet: '1MIbogClTa2dL_JuddC0Uw-_uTDjVN-GNrqPiD4Dty6A',
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
  translations: [SHEET_URLS.new_interslavic_words_list, 1_987_833_874],
  flavorizations: [SHEET_URLS.analysis, 1_265_463_098],
  be: [SHEET_URLS.analysis, 1_255_283_172],
  bg: [SHEET_URLS.analysis, 842_167_821],
  cs: [SHEET_URLS.analysis, 2_049_157_610],
  hr: [SHEET_URLS.analysis, 1_994_073_164],
  mk: [SHEET_URLS.analysis, 1_446_524_003],
  pl: [SHEET_URLS.analysis, 392_567_566],
  ru: [SHEET_URLS.analysis, 178_587_423],
  sk: [SHEET_URLS.analysis, 2_125_328_901],
  sl: [SHEET_URLS.analysis, 1_412_251_584],
  sr: [SHEET_URLS.analysis, 459_290_131],
  uk: [SHEET_URLS.analysis, 2_098_204_280],
};
