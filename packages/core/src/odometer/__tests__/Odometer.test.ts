import { core, parse } from '@interslavic/steen-utils';

import { Odometer } from '../Odometer';
import { Intermediate } from '../../multireplacer';

describe('Odometer', () => {
  test('integration (simple)', () => {
    const odometer = new Odometer<core.Synset, core.Lemma>({
      extractItems: (synset) => synset.lemmas(),
      extractValue: (i) => i.value,
    });

    const q = parse.synset('morje, måre', { isPhrase: false });
    const r = parse.synset('miare, mare', { isPhrase: false });
    const result = odometer.compare(q, r);

    expect(result).toEqual({
      query: expect.objectContaining({ value: 'måre' }),
      result: expect.objectContaining({ value: 'mare' }),
      editingDistance: 1,
      editingDistancePercent: 25,
    });
  });

  test('integration (dedupe)', () => {
    const odometer = new Odometer<Intermediate[], Intermediate>({
      ignoreCase: true,
      ignoreNonLetters: true,
      extractItems: (i) => i,
      extractValue: (i) => i.value,
    });

    const [Q, ...R] = ['rybomlåt', 'риба-молот', 'СТРАШНА РИБА'].map(
      (s) => new Intermediate(s, null),
    );

    const [q1, q2] = ['рибомлат', 'рибомолот'].map(
      (s) => new Intermediate(s, Q),
    );

    const result = odometer.compare([q1, q2], R);

    expect(result).toEqual({
      query: q2,
      result: R[0],
      editingDistance: 1,
      editingDistancePercent: 11,
    });
  });
});
