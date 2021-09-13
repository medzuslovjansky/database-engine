import { promises as fs } from 'fs';
import { mapFlavorizationRule } from '../mappers/flavorizationRule';
import { mapWords } from '../mappers/words';
import { parseCSV } from './parseCSV';
import { mapIntelligibilityRecord } from '../mappers/intelligibility';
import { PartOfSpeech } from '@interslavic/steen-utils/types';
import { FlavorizationRuleDTO, IntelligibilityDTO, WordsDTO } from '../types';
import { DatabaseContext } from '../types/core/DatabaseContext';

async function readFixture(filePath: string) {
  const buffer = await fs.readFile(
    require.resolve(`../../__fixtures__/${filePath}`),
  );

  return await parseCSV(buffer);
}

export async function readRules(lang: string): Promise<FlavorizationRuleDTO[]> {
  const rawRecords = await readFixture(`rules/${lang}.csv`);
  const rules = rawRecords.map(mapFlavorizationRule);

  return rules;
}

export async function readWords(): Promise<WordsDTO[]> {
  const rawVocabulary = await readFixture('words.csv');
  return rawVocabulary.map(mapWords);
}

export function asDB(vocabulary: WordsDTO[]): DatabaseContext {
  const idToWord = new Map(vocabulary.map((v) => [v.id, v]));

  function getWordById(id: string): WordsDTO {
    const w = idToWord.get(id);
    if (!w) {
      throw new Error(`Not found by id = ${id}`);
    }

    return w;
  }

  function getPartOfSpeech(id: string): PartOfSpeech {
    return getWordById(id).partOfSpeech;
  }

  return {
    getWordById,
    getPartOfSpeech,
  };
}

export async function readTranslations(
  db: DatabaseContext,
  lang: string,
): Promise<IntelligibilityDTO[]> {
  const rawTranslations = await readFixture(`translations/${lang}.csv`);
  return rawTranslations.map((r) => mapIntelligibilityRecord(r, db));
}
