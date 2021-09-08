import { promises as fs } from 'fs';
import { parseRuleSheet } from './parseRuleSheet';
import { parseVocabulary } from './parseVocabulary';

async function readFixture(filePath: string) {
  return fs.readFile(require.resolve(`../../__fixtures__/${filePath}`));
}

export async function readRules(lang: string) {
  const content = await readFixture(`rules/${lang}.csv`);
  return await parseRuleSheet(content);
}

export async function readTranslations(lang: string) {
  const vocabulary = await readFixture('vocabulary.csv');
  const translations = await readFixture(`translations/${lang}.csv`);

  return parseVocabulary(vocabulary, translations);
}
