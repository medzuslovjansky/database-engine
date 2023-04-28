import parseSynset from './parseSynset';

describe('parseSynset', () => {
  test.each([
    [''],
    ['!'],
    ['#'],
    ['#!'],
    ['!#'],
    ['!#course'],
    ['!U-Boot'],
    ['#co-worker'],
    ['#!only, ĝuste nun'],
    ["з'явитися"],
    ['сей (устар.; местоим.)'],
    ['за (напр.: по грибы, за хлебом), по'],
    ['bring (up) to'],
    ['и; а зато (смысл2)'],
    ['Добрий ранок!, Доброго ранку!'],
  ])(
    'should parse synset: %s',
    (value: string) => {
      const synset = parseSynset(value);
      expect(synset).toMatchSnapshot('synset');
      expect(`${synset}`).toMatchSnapshot('toString');
    },
  );
});
