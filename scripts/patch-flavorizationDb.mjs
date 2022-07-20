import 'zx/globals';
import * as csv from './utils/csv.mjs';


async function main() {
  const FLAVORIZATION = `__fixtures__/flavorization-pl-new.csv`;
  const AUTO = `__fixtures__/auto-results.tsv`;
  let insertions = 0;
  const idMap = [];

  const michal = await csv.parseFile(FLAVORIZATION);
  const auto = await csv.parseFile(AUTO, '\t');
  const autoMap = new Map(auto.filter(r => r.zapis.length > 1).map(r => [r.id, r.zapis]));
  const autoIds = new Set(auto.filter(r => r.id > 0).map(r => r.id));

  for (const record of michal) {
    if (!record.pl.startsWith('!') || autoIds.has(record.id)) {
      idMap.push(record.id);
    }

    if (record.pl.startsWith('!') && autoMap.has(record.id)) {
      insertions++;
      record.pl = autoMap.get(record.id);
      if (record.pl === '!' + record.addition) {
        record.pl = record.addition;
        record.addition = '';
      }
    }

    if (record.addition.length > 2 && !record.addition.includes('.') && !record.addition.includes('(') && !record.addition.includes(',')) {
      record.pl = record.addition;
      record.addition = '';
    }

    if (record.addition === '.' && record.pl.startsWith('!') && !record.pl.includes(' ')) {
      record.pl = record.pl.slice(1);
      record.addition = '';
    }
  }

  console.log('Helped Michal with ', insertions, 'insertions!');
  await csv.writeFile(`__fixtures__/enriched-pl.csv`, michal);
  await fs.writeFile(`__fixtures__/processed.json`, JSON.stringify(idMap));
}

await main();
