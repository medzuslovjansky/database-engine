import fse from 'fs-extra';
import tempfile from 'tempfile';
import { InterslavicSynset, Synset } from '@interslavic/database-engine-core';

import { FileDatabase } from './FileDatabase';

describe('FileDatabase', () => {
  const rootDirectory = tempfile({ extension: '' });

  let database: FileDatabase;

  beforeAll(async () => {
    const { AES256CTRService } = jest.requireMock('./crypto/AES256CTRService');

    await fse.ensureDir(rootDirectory);
    database = new FileDatabase({
      rootDirectory,
      cryptoService: new AES256CTRService(),
    });
  });

  afterAll(async () => {
    await fse.remove(rootDirectory);
  });

  describe('multisynsets', () => {
    it('should be empty on start', async () => {
      expect(await database.multisynsets.values()).toHaveLength(0);
    });

    it('should add values', async () => {
      const isv = InterslavicSynset.parse('oko');
      isv.lemmas[0]!.steen = {
        id: 1,
        addition: 'očese',
        partOfSpeech: 'n.',
        type: 1,
        sameInLanguages: 'ru~ be~ uk z j',
      };

      await database.multisynsets.insert({
        id: 1,
        synsets: {
          isv: isv,
          uk: Synset.parse('око'),
          pl: Synset.parse('oko'),
        },
      });

      expect(await database.multisynsets.keys()).toEqual([1]);
    });

    it('should be able to find values by id', async () => {
      const multisynset = await database.multisynsets.findById(1);
      expect(multisynset).not.toBeUndefined();
      expect(`${multisynset!.synsets.isv}`).toEqual('oko');
    });

    it('should be able to find values by predicate', async () => {
      const multisynset = await database.multisynsets.find((multisynset) => {
        return multisynset.synsets.isv!.includes('oko');
      });
      expect(multisynset).not.toBeUndefined();
      expect(multisynset!.id).toBe(1);
    });

    it('should be able to filter values by predicate', async () => {
      const multisynsets = await database.multisynsets.filter(
        (multisynset) => `${multisynset.id}` === '1',
      );
      expect(multisynsets).toHaveLength(1);
    });

    it('should be able to bulk update entities', async () => {
      // eslint-disable-next-line unicorn/no-array-for-each
      await database.multisynsets.forEach((multisynset) => {
        for (const l of multisynset.synsets.isv!.lemmas) {
          l.steen!.partOfSpeech = 'm.';
        }
      });

      const multisynset = await database.multisynsets.findById(1);
      expect(multisynset!.synsets.isv!.lemmas[0]!.steen!.partOfSpeech).toBe(
        'm.',
      );
    });

    it('should be able to delete entities', async () => {
      await database.multisynsets.delete({ id: 1 });
      expect(await database.multisynsets.values()).toHaveLength(0);
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
