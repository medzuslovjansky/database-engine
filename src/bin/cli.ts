import {
  asDB,
  readRules,
  readTranslations,
  readWords,
} from '../utils/fixtures';
import { IntelligibilityCalculator } from '../api/IntelligibilityCalculator';
import { FlavorizationMatch } from '../types';

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

    const d = (level: 'standard' | 'mistaken' | 'etymological'): number => {
      return result[level].distance.absolute;
    };

    const report = (match: FlavorizationMatch): string => {
      const isv = match.interslavic.value;
      const nat = match.national.value;
      return `D(${isv}, ${nat}) = ${match.distance.absolute}`;
    };

    if (d('mistaken') > (d('standard') + 1) && d('standard') > (d('etymological') + 1)) {
      if (result.mistaken.interslavic.value.includes('дж')) {
        console.log(`#${result.id}`);
        console.log(`Interslavic: ${word.isv}`);
        console.log(`Translation: ${intelligibility.translations}`);
        console.log(`Mistaken ${report(result.mistaken)}`);
        console.log(`Standard ${report(result.standard)}`);
        console.log(`Etymological ${report(result.etymological)}`);
      }
    }
  }
}

main('ru');
