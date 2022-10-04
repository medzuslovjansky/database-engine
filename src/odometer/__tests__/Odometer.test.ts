import { Odometer } from '../Odometer';
import { Intermediate } from '../../multireplacer';

describe('Odometer', () => {
  test('integration (simple)', () => {
    const odometer = new Odometer<Intermediate>({
      extractValue: (i) => i.value,
    });

    const [q1, q2, r1, r2] = ['morje', 'måre', 'miare', 'mare'].map(
      (s) => new Intermediate(s, null),
    );

    const result = odometer.compare([q1, q2], [r1, r2]);

    expect(result).toEqual({
      query: q2,
      result: r2,
      editingDistance: 1,
      editingDistancePercent: 25,
    });
  });

  test('integration (dedupe)', () => {
    const odometer = new Odometer<Intermediate>({
      ignoreCase: true,
      ignoreNonLetters: true,
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
