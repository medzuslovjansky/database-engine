import { core } from '@interslavic/steen-utils';
import { Odometer } from '@interslavic/odometer';

import { BareRecord } from '../types';
import { readRules, readTranslations } from '../utils/fixtures';

async function main(lang: string) {
  console.log(
    [
      'id',
      'isv',
      'translation',
      'distance',
      'flavorISV',
      'flavorTrans',
      'chainA',
      'chainB',
    ].join('\t'),
  );

  const rules = await readRules(lang);
  const translations = await readTranslations(lang);

  const values = (s: core.Synset) => [...s.lemmas()].map((l) => l.value);
  const odometer = new Odometer<BareRecord>();
  for (const t of translations) {
    if (!t.translation) {
      continue;
    }

    const theLang = rules.Reverse.process(values(t.translation), t);
    const theISV = rules.Etymological.process(values(t.isv), t);
    let { a, b, distance } = odometer.getDifference(
      theISV.variants,
      theLang.variants,
    );

    // if (a && b) {
    //   ({ a, b, distance } = odometer.getDifference(
    //     rules.Heuristic.process([a.value], t).variants,
    //     rules.Heuristic.process([b.value], t).variants,
    //   ));
    // }

    if (a && b) {
      const chainA = [...a.replacements()]
        .map((r) => rules.Etymological.rules.find(r))
        .map((r) => `${r?.comment}`)
        .join(', ');

      const chainB = [...b.replacements()]
        .map((r) => rules.Reverse.rules.find(r))
        .map((r) => `${r && r.comment}`)
        .join(', ');

      // let report = '';
      // report += `(${t.isv}) ∩ (${t.translation}) = ${a.root} ÷ ${b.root}`;
      // report += `\nISV: ${a.root} → ${a} (${chainA})`;
      // report += `\n${lang.toUpperCase()}: ${b.root} → ${b} (${chainB})`;
      // report += `\nΔ(${a}, ${b}) ≈ ${distance}`;

      const report = [
        t.id,
        t.isv,
        t.translation,
        `${Math.max(0, Math.min(Math.round(distance * 100), 100))}`,
        a,
        b,
        chainA,
        chainB,
      ].join('\t');

      console.log(report);
    }
  }
}

main('ru');
