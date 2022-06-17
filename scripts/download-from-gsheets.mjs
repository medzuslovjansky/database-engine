import "zx/globals";
import { SHEET_URLS, GIDs, LANGS } from "./utils/constants.mjs";

async function downloadSheet(outFile, baseUrl, gid) {
  await $`curl -L -o ${outFile} ${`${baseUrl}&single=true&gid=${gid}`}`
}

await fs.mkdirp('__fixtures__/analysis');
await fs.mkdirp('__fixtures__/rules');

await downloadSheet(`__fixtures__/words.csv`, SHEET_URLS.new_interslavic_words_list, GIDs.new_interslavic_words_list.words);
for (const lang of LANGS) {
  await downloadSheet(`__fixtures__/analysis/${lang}.csv`, SHEET_URLS.analysis, GIDs.analysis[lang]);
  await downloadSheet(`__fixtures__/rules/${lang}.csv`, SHEET_URLS.rules, GIDs.rules[lang]);
}
