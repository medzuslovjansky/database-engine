import createMapReplacer from '../createMapReplacer';
import { Splitters } from '@interslavic/odometer';

describe('createMapReplacer', () => {
  test.each([
    ['', undefined, '', ''],
    ['', undefined, 'abc', 'abc'],
    ['a- b- c-', undefined, 'abc', ''],
    ['b-б c-ц d-д', undefined, 'bcd', 'бцд'],
    ['b-б c-ц d-д', undefined, 'BCD', 'БЦД'],
    ['B-Б C-Ц D-Д', undefined, 'BCD', 'БЦД'],
    ['B-Б C-Ц D-Д', undefined, 'bcd', 'бцд'],
    ['ě-ie', { strict: true }, 'běg', 'bieg'],
    ['b-б c-ц d-д', { strict: true }, 'bcdBCD', 'бцдBCD'],
  ])(
    '(%j, %j) should create a replacer which processes %j into %j',
    (pattern, options, input, expected) => {
      const replacer = createMapReplacer(pattern, options);
      expect(input.replace(Splitters.letter, replacer)).toBe(expected);
    },
  );
});
