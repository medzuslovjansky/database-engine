import { getEditingDistance } from './getEditingDistance';

const diff = (a: string, b: string) => (a === b ? 0 : 1);

test.each([
  ['a', 'a', 0],
  ['a', 'ǎ', 1],
  ['אָ', 'א', 1],
  ['noc', 'nòč', 2],
  ['се', 'се', 0],
  ['се', 'сё', 1],
  ['о́', 'о', 1],
])('getEditingDistance(%j, %j) should equal %d', (a, b, expected) => {
  expect(getEditingDistance(a, b, diff)).toBe(expected);
});
