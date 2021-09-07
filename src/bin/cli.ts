import { promises as fs } from 'fs';

import { core } from '@interslavic/steen-utils';
import { Odometer } from '@interslavic/odometer';

import { parseRuleSheet, parseVocabulary } from '../utils';

async function main() {
  const [rulesBuffer, isvBuffer, translationBuffer] = await Promise.all(
    ['rules_cs', 'vocab_isv', 'translation_cs'].map((name) =>
      fs.readFile(require.resolve(`../../__fixtures__/${name}.csv`)),
    ),
  );

  const rules = await parseRuleSheet(rulesBuffer);
  const translations = await parseVocabulary(isvBuffer, translationBuffer);

  const values = (s: core.Synset) => [...s.lemmas()].map((l) => l.value);
  const odometer = new Odometer();
  for (const t of translations) {
    if (!t.translation || t.id > 30) {
      continue;
    }

    const theLang = rules.Reverse.process(values(t.translation), t);
    const theISV = rules.Standard.process(values(t.isv), t);
    const { a, b, distance } = odometer.getDifference(
      theISV.variants,
      theLang.variants,
    );

    if (a && b) {
      const chainA = [...a.replacements()]
        .map((r) => rules.Standard.rules.find(r))
        .map((r) => `${r?.id}`)
        .join(', ');

      const chainB = [...b.replacements()]
        .map((r) => rules.Standard.rules.find(r))
        .map((r) => `${r && r.id}`)
        .join(', ');

      let report = '';
      report += `(${t.isv}) ∩ (${t.translation}) = ${a.root} ÷ ${b.root}`;
      report += `\nISV: ${a.root} → ${a} (${chainA})`;
      report += `\nCS: ${b.root} → ${b} (${chainB})`;
      report += `\nΔ(${a}, ${b}) ≈ ${distance}`;

      expect(report).toMatchSnapshot(`${t.id}: ${t.isv}`);
    }
  }
}

main();
