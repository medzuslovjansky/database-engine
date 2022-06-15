import generate from '../flavorizers/sr';

describe('Interslavic → Polish', () => {
  const sr = generate();

  test.each([
    ['vśaky', 'сваки', 'adj.', ''],
    ['kȯgda', 'када', '', ''],
  ])('%s → %s (%s)', (source, target, partOfSpeech, genesis) => {
    expect(sr.flavorize(source, partOfSpeech, genesis)).toContain(target);
  });
});
