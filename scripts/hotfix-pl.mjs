import 'zx/globals';
import _ from 'lodash';
import * as csv from './utils/csv.mjs';

await main();

async function main() {
  const WORDS_PATH = `__fixtures__/analysis/pl.csv`;
  const FLAV = `__fixtures__/flavorization-pl.csv`;

  // const rawFlav = await csv.parseFile(FLAV);
  // const ids = _(rawFlav).groupBy(f => f.id).mapValues(f => f[0]).value();

  const rawWords = await csv.parseFile(WORDS_PATH);
  for (const word of rawWords) {
    // word.flavorization = ids[word.id].pl;
    if (word.translationOriginal.split(/\s*,\s*/).includes(word.flavorization)) {
      word.translationMatch = word.flavorization;
      console.log(word.flavorization);
    }

    // if (word.translationMatch === word.flavorization || word.helperWords === word.flavorization) {
    //   word.flavorization = word.translationMatch;
    // }
  }

  await csv.writeFile(WORDS_PATH, rawWords);
}
