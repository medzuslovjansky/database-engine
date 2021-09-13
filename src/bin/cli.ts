import {
  asDB,
  readRules,
  readTranslations,
  readWords,
} from '../utils/fixtures';
import { IntelligibilityCalculator } from '../api/IntelligibilityCalculator';

function asPercent(v: number): string {
  return Math.round(v * 100) + '%';
}

async function main(lang: string) {
  const words = await readWords();
  const rules = await readRules(lang);
  const db = asDB(words);
  const translations = await readTranslations(db, lang);

  const calculator = new IntelligibilityCalculator(rules);

  for (const intelligibility of translations) {
    const word = db.getWordById(intelligibility.id);
    const result = calculator.calcSimilarity({
      words: word,
      intelligibility,
    });

    console.log(`#${result.id}`);
    console.log(`\nInterslavic:\n${word.isv}`);
    console.log(`\nTranslation:\n${intelligibility.translations}`);
    console.log(`\nBest match:\n${asPercent(result.most.distance)}`);
    console.log('\nTransformation chain:\n');
  }
}

main('ru');
