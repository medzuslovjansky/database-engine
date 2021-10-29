import {
  FlavorizationRuleDTO,
  IntelligibilityDTO,
  LanguageKey,
  RawRecord,
  WordsDTO,
} from '../../db';
import { promises as fs } from 'fs';
import __projectwise from '../../__projectwise';
import { parseCSV } from './parseCSV';

export class FixtureDatabase {
  private words: WordsDTO[] | null = null;
  private rules: Record<string, FlavorizationRuleDTO[]> = {};
  private intelligibility: Record<string, IntelligibilityDTO[]> = {};

  public async getWords(): Promise<WordsDTO[]> {
    if (!this.words) {
      const rawVocabulary = await this.readFixture('words.csv');
      this.words = rawVocabulary.map((r) => new WordsDTO(r));
      return this.words;
    }

    return this.words;
  }

  public async getRules(lang: LanguageKey): Promise<FlavorizationRuleDTO[]> {
    if (!this.rules[lang]) {
      const rawRecords = await this.readFixture(`rules/${lang}.csv`);
      const rules = rawRecords.map((r) => new FlavorizationRuleDTO(r));
      this.rules[lang] = rules;
      return rules;
    }

    return this.rules[lang];
  }

  public async getIntelligiblity(
    lang: LanguageKey,
  ): Promise<IntelligibilityDTO[]> {
    if (!this.intelligibility[lang]) {
      const rawRecords = await this.readFixture(`translations/${lang}.csv`);
      return rawRecords.map((r) => new IntelligibilityDTO(r));
    }

    return this.intelligibility[lang];
  }

  private async readFixture(filePath: string): Promise<RawRecord[]> {
    const buffer = await fs.readFile(__projectwise(`__fixtures__/${filePath}`));
    return await parseCSV(buffer);
  }
}
