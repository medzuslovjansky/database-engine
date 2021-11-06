import { maxBy } from 'lodash';
import { FixtureDatabase } from './local-db/FixtureDatabase';
import {
  FlavorizationTable,
  FlavorizationRule,
  TranslationContext,
  TranslationAnalysis,
  FlavorizationContext,
} from '../api';
import { LanguageKey } from '../dto';
import { Replacement } from '@interslavic/odometer';

async function main(lang: LanguageKey) {
  const db = new FixtureDatabase();
  const rules = (await db.getRules(lang))
    .filter((r) => !r.disabled)
    .map((r) => new FlavorizationRule(r));
  const translations = (await db.getWords()).map(
    (r) => new TranslationContext(r, lang),
  );
  const calculator = new FlavorizationTable(rules);

  const results: TranslationAnalysis[] = [];
  for (const t of translations) {
    const result = calculator.analyzeTranslations(t, 'Etymological');
    results.push(result);

    const line = [
      result.id,
      t.interslavic.toString(),
      t.translations.toString(),
    ];
    for (const { interslavic, distance, national } of result.matches) {
      if (distance.percent < 50) {
        line.push(
          `${national.root?.value} (${distance.percent}%; ${interslavic.value})`,
        );
      }
    }
    if (line.length === 3) {
      line.push('N/A');
    }
    console.log(line.join('\t'));
  }

  const stats: any = {};
  for (const rule of rules) {
    stats[rule.name] = new Array(rule.replacements.length);
    stats[rule.name].fill(0);
    for (let i = 0; i < 5; i++) {
      stats[rule.name][i] = i < rule.replacements.length ? 0 : NaN;
    }
  }

  for (const r of results) {
    const bestMatch = r.matches[0];
    if (bestMatch && bestMatch.distance.percent < 50) {
      const replacements = [...bestMatch.interslavic.chain()]
        .map((r) => r.via)
        .filter<Replacement<unknown, FlavorizationContext>>(Boolean as any);

      for (const repl of replacements) {
        const theRule = calculator.replacers.Etymological.rules.find(repl);
        if (theRule) {
          const name = theRule.name;
          const variantIndex = theRule.indexOf(repl);
          stats[name][variantIndex] = 1 + (stats[name][variantIndex] || 0);
        }
      }
    }
  }

  console.log('\n\nRecords count:', translations.length);
  console.log('Rule statistics:');
  const maxRuleLen = maxBy(rules, (r) => r.name.length)?.name.length || 0;
  for (const [key, value] of Object.entries(stats)) {
    console.log([key.padEnd(maxRuleLen), ...(value as any[])].join('\t'));
  }
}

main('pl');
