import { FlavorizationTable } from '../api/flavorizationTable/FlavorizationTable';
import { FixtureDatabase } from './db/FixtureDatabase';
import { FlavorizationRule } from '../api/flavorizationRule';
import { TranslationContext } from '../api/flavorizationTable/TranslationContext';
import { LanguageKey } from '../db';

async function main(lang: LanguageKey) {
  const db = new FixtureDatabase();
  const rules = (await db.getRules(lang))
    .filter((r) => !r.disabled)
    .map((r) => new FlavorizationRule(r));
  const translations = (await db.getWords()).map(
    (r) => new TranslationContext(r, lang),
  );
  const calculator = new FlavorizationTable(rules);

  for (const t of translations) {
    const result = calculator.analyzeTranslations(t, 'Etymological');
    const line = [result.id, t.interslavic.toString()];
    for (const { interslavic, distance, national } of result.matches) {
      if (distance.percent < 50) {
        line.push(
          `${national.root?.value} (${distance.percent}%; ${interslavic.value})`,
        );
      }
    }
    console.log(line.join('\t'));
  }
}

main('ru');
