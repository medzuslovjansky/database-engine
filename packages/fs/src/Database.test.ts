import fse from 'fs-extra';
import tempfile from 'tempfile';

import { Database } from './Database';

describe('Database', () => {
  const rootDirectory = tempfile('');

  let database: Database;

  beforeAll(async () => {
    const { PIIHelper } = jest.requireMock('./utils/PIIHelper');

    await fse.ensureDir(rootDirectory);
    database = new Database({
      rootDirectory,
      piiHelper: new PIIHelper(),
    });
  });

  afterAll(async () => {
    await fse.remove(rootDirectory);
  });

  describe('lemmas', () => {
    it('should be empty on start', async () => {
      expect(await database.lemmas.keys()).toHaveLength(0);
    });

    it('should add values', async () => {
      await database.lemmas.insert({
        id: 1,
        isv: ['oko'],
        partOfSpeech: 'n.',
        translations: {
          uk: ['око'],
          pl: ['oko'],
        },
      });

      expect(await database.lemmas.keys()).toEqual([1]);
    });

    it('should be able to find values by id', async () => {
      const lemma = await database.lemmas.findById(1);
      expect(lemma).not.toBeUndefined();
      expect(lemma?.isv).toEqual(['oko']);
    });

    it('should be able to find values by predicate', async () => {
      const lemma = await database.lemmas.find((lemma) =>
        lemma.isv.includes('oko'),
      );
      expect(lemma).not.toBeUndefined();
      expect(lemma?.id).toBe(1);
    });

    it('should be able to filter values by predicate', async () => {
      const lemmas = await database.lemmas.filter((lemma) => lemma.id === 1);
      expect(lemmas).toHaveLength(1);
    });

    it('should be able to bulk update entities', async () => {
      await database.lemmas.forEach((lemma) => {
        lemma.partOfSpeech = 'neuter';
      });

      const lemma = await database.lemmas.findById(1);
      expect(lemma?.partOfSpeech).toBe('neuter');
    });

    it('should be able to delete entities', async () => {
      await database.lemmas.delete({ id: 1 });
      expect(await database.lemmas.values()).toHaveLength(0);
    });
  });

  describe('users', function () {
    it('should have no users at start', async () => {
      const users = await database.users.values();
      expect(users).toHaveLength(0);
    });
  });

  describe('spreadsheets', function () {
    it('should have no spreadsheets at start', async () => {
      const spreadsheets = await database.spreadsheets.values();
      expect(spreadsheets).toHaveLength(0);
    });
  });
});
