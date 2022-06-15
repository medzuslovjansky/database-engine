import generate from '../flavorizers/pl';

describe('Interslavic → Polish', () => {
  const pl = generate();

  test.each([
    ['česť', 'cześć', 'f.', ''],
    ['kazati', 'kazać', 'v. ipf.', ''],
  ])('%s → %s (%s)', (source, target, partOfSpeech, genesis) => {
    expect(pl.flavorize(source, partOfSpeech, genesis)).toContain(target);
  });
});
