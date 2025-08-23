import { Synset } from '../synset';

import { MultilingualSynset } from './MultilingualSynset';

describe('MultilingualSynset', () => {
  it('should be serializable and deserializable with JSON', () => {
    const synset = new Synset({
      verified: true,
      lemmas: [],
    });
    const isvSynset = Synset.parse('oko');
    const debatedSet = new Set([
      'id',
      'isv',
      'en',
      'ru',
      'using_example',
    ] as const);

    const original = new MultilingualSynset();
    original.id = 42;
    original.beta = true;
    original.synsets.isv = isvSynset;
    original.synsets.en = synset;
    original.steen = { debated: debatedSet };

    // Serialize to JSON and back
    const json = original.toJSON();
    const deserialized = MultilingualSynset.fromJSON(json);

    // Verify equality using the equals method
    expect(deserialized.equals(original)).toBe(true);
    const json2 = deserialized.toJSON();

    expect(json2).toEqual(json);
  });
});
