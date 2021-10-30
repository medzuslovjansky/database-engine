import { FixtureDatabase } from './local-db/FixtureDatabase';
import {
  FlavorizationTable,
  FlavorizationRule,
  TranslationContext,
} from '../api';
import { LanguageKey } from '../dto';

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
