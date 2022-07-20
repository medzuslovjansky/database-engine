import 'zx/globals';
import _ from 'lodash';
import * as csv from './utils/csv.mjs';
import { core, parse } from "@interslavic/steen-utils";
import { loadDictionary } from "./utils/hunspell.mjs";
import razumlivost from "../dist/index.js";
import { Intermediate, Odometer } from "@interslavic/odometer";

const processed = JSON.parse(await fs.readFile('__fixtures__/processed.json'));
const { flavorizers } = razumlivost;

const [_MOD, _DIV] = [process.argv[3], process.argv[4]].map(Number);
console.log(_MOD, _DIV)

async function main() {
  const WORDS_PATH = `__fixtures__/words.csv`;

  const odometer = new Odometer();
  const rawWords = await csv.parseFile(WORDS_PATH);
  const hunspell = await loadDictionary('pl');
  let n = rawWords.length;
  for (const w of rawWords) {
    if (n-- % _DIV !== _MOD) {
      continue;
    }
    if (processed.includes(`${w.id}`)) {
      continue;
    }

    const pos = parse.partOfSpeech(w.partOfSpeech);
    const isv = parse.synset(w.isv, { isPhrase: pos.name === 'phrase' });
    const out = new core.Synset();
    const group = new core.LemmaGroup();
    out.groups.push(group);
    for (const lemma of isv.lemmas()) {
      const variants = flavorizers.pl.flavorizeDebug(lemma.toString(), w.partOfSpeech, w.genesis);
      const lemmaHasSpaces = lemma.value.includes(' ');
      const lemmaHasDash = lemma.value.includes('-');
      const suggestions = _.uniq(variants.flatMap(v => hunspell.suggestSync(v.value) || []).filter(o => o.includes(' ') === lemmaHasSpaces && o.includes('-') === lemmaHasDash));
      if (suggestions.length === 0) {
        continue;
      }
      const sugi = suggestions.map(s => new Intermediate(s, null));
      const sorted = odometer.sortByRelevance(variants, sugi);
      const best = sorted[0];
      if (best && best.editingDistance <= (lemma.value.length / 2)) {
        group.lemmas.push(new core.Lemma({ value: best.result.value }));
      }
    }
    console.log('OK\t' + w.id + '\t' + out);
  }

  // await csv.writeFile(`__fixtures__/words.pl.csv`, newWords);
}

await main();
