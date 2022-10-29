import "zx/globals";
import { SHEET_URLS, GIDs, LANGS } from "../../utils/constants.ts";
import { downloadSheet } from "../../utils/gsheets.ts";

await fs.mkdirp('__fixtures__/analysis');

await downloadSheet(`__fixtures__/words.csv`, SHEET_URLS.new_interslavic_words_list, GIDs.new_interslavic_words_list.words);
await downloadSheet(`__fixtures__/flavorizations.csv`, SHEET_URLS.analysis, GIDs.analysis.flavorizations);

for (const lang of LANGS) {
  await downloadSheet(`__fixtures__/analysis/${lang}.csv`, SHEET_URLS.analysis, GIDs.analysis[lang]);
}
