import { createArrayMapperClass } from '@interslavic/database-engine-google/src/utils/createArrayMapperClass';

import { toMultiSynset } from './toMultiSynset';

describe('toMultiSynset', () => {
  const WordsRecord = createArrayMapperClass('WordsRecord', [
    'id',
    'isv',
    'addition',
    'partOfSpeech',
    'type',
    'en',
    'sameInLanguages',
    'genesis',
    'ru',
    'be',
    'uk',
    'pl',
    'cs',
    'sk',
    'bg',
    'mk',
    'sr',
    'hr',
    'sl',
    'cu',
    'de',
    'nl',
    'eo',
    'frequency',
    'intelligibility',
    'using_example',
  ]);

  test('should convert an array-mapped dto to a MultiSynset', () => {
    const dto = new WordsRecord({
      id: '1',
      isv: 'oko',
      addition: '#očese',
      partOfSpeech: 'n.',
      type: '1',
      en: 'eye',
      sameInLanguages: 'ru~ ub z j',
      genesis: 'S',
      ru: 'глаз',
      be: '#вока',
      uk: 'око',
      pl: 'oko',
      cs: 'oko',
      sk: 'oko',
      bg: 'око',
      mk: 'око',
      sr: 'око',
      hr: 'oko',
      sl: 'oko',
      cu: 'око',
      de: 'Auge',
      nl: 'oog',
      eo: 'okulo',
      frequency: 0.123,
      intelligibility: 'N/A',
      using_example: 'N/A',
    });

    const multisynset = toMultiSynset(dto);
    expect([...multisynset.steen!.debated!.values()]).toEqual([
      'addition',
      'be',
    ]);
    expect(multisynset.id).toBe(1);
    expect(`${multisynset.synsets.isv}`).toBe('oko');
    expect(`${multisynset.synsets.isv!.lemmas[0]!.steen!.addition}`).toBe(
      'očese',
    );
  });
});
