import "zx/globals";
import { SHEET_URLS, GIDs, LANGS } from "./utils/constants.mjs";

await fs.mkdirp('__fixtures__/analysis');

await downloadSheet(`__fixtures__/words.csv`, SHEET_URLS.new_interslavic_words_list, GIDs.new_interslavic_words_list.words);
for (const lang of LANGS) {
  await downloadSheet(`__fixtures__/analysis/${lang}.csv`, SHEET_URLS.analysis, GIDs.analysis[lang]);
}
