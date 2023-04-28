import { Lemma } from '../lemma';

import { Synset } from './Synset';

describe('Synset', () => {
  describe('when created', () => {
    describe('with no options', () => {
      it('should contain no lemmas', () => {
        expect(anEmptySynset().lemmas).toEqual([]);
      });

      it('should not report itself as verified', () => {
        expect(anEmptySynset().verified).toBe(false);
      });

      it('should not report itself as debatable', () => {
        expect(anEmptySynset().debatable).toBe(false);
      });

      it('should be empty', () => {
        expect(anEmptySynset().isEmpty()).toBe(true);
      });
    });

    describe('with options', () => {
      it('should contain those lemmas', () => {
        const { synset, lemmas } = aComplexSynset();
        expect(synset.lemmas).toEqual(lemmas);
      });

      it('should have .verified property', () => {
        const { synset, meta } = aComplexSynset();
        expect(synset.verified).toBe(meta.verified);
      });

      it('should have .debatable property', () => {
        const { synset, meta } = aComplexSynset();
        expect(synset.debatable).toBe(meta.debatable);
      });

      it('should be not empty', () => {
        const { synset } = aComplexSynset();
        expect(synset.isEmpty()).toBe(false);
      });
    });
  });

  describe('.add()', () => {
    it('should add a string', () => {
      const synset = anEmptySynset();
      expect(synset.add('value').toString()).toBe('!value');
    });

    it('should add a string array', () => {
      const synset = anEmptySynset();
      expect(synset.add(['value1', 'value2']).toString()).toBe(
        '!value1, value2',
      );
      expect(synset.lemmas.length).toBe(2);
    });

    it('should add a string array (with commas)', () => {
      const synset = anEmptySynset();
      expect(synset.add(['value1, value2', 'value3']).toString()).toBe(
        '!value1, value2; value3',
      );
      expect(synset.lemmas.length).toBe(2);
    });

    it('should add a lemma', () => {
      const synset = anEmptySynset();
      const lemma = new Lemma({
        value: 'value',
        annotations: ['some annotation'],
      });

      expect(synset.add(lemma).toString()).toBe('!value (some annotation)');
    });

    it('should add an array of lemmas', () => {
      const synset = anEmptySynset();
      const lemma1 = Lemma.parse('value (annot.)');
      const lemma2 = new Lemma({ value: 'value2' });

      expect(synset.add([lemma1, lemma2]).toString()).toBe(
        '!value (annot.), value2',
      );
    });

    it('should throw an attempt to pass something else', () => {
      const synset = anEmptySynset();
      const smth = {} as any;
      expect(() => synset.add(smth)).toThrowError(/Invalid value type.*Object/);
    });
  });

  describe('.clear()', () => {
    it('should mutate and clear lemmas', () => {
      const synset = anEmptySynset().add('something');
      synset.clear();
      expect(synset.toString()).toBe('!');
    });
  });

  describe('.clone()', () => {
    it('should deep clone the synset', () => {
      const synset = anEmptySynset().add(
        new Lemma({
          value: 'hello',
          annotations: ['greeting'],
        }),
      );

      const clone = synset.clone();

      expect(clone.toString()).toBe('!hello (greeting)');
      expect(clone.toString()).toBe(synset.toString());
      expect(clone).not.toBe(synset);
      expect(clone.lemmas).not.toBe(synset.lemmas);
      expect(clone.lemmas[0]).not.toBe(synset.lemmas[0]);
      expect(clone.lemmas[0].annotations).not.toBe(
        synset.lemmas[0].annotations,
      );
    });
  });

  describe('.size', () => {
    it('should return lemma count', () => {
      const synset = anEmptySynset();
      expect(synset.size).toBe(0);
      synset.add(['some1', 'some2']);
      expect(synset.size).toBe(2);
    });
  });

  describe('.union()', () => {
    it('should create a new synset with all the values', () => {
      const synset1 = anEmptySynset().add(['a', 'b']);
      const synset2 = anEmptySynset().add(['b', 'c']);
      const union = synset1.union(synset2);

      expect(union).not.toBe(synset1);
      expect(union).not.toBe(synset2);
      expect(union.toString()).toBe('!a, b, c');
    });

    it('should always take the worst-case metadata', () => {
      const synset1 = anEmptySynset().add(['a', 'b']);
      const synset2 = anEmptySynset();
      synset1.verified = false;
      synset1.debatable = true;

      const union = synset1.union(synset2);
      expect(union.toString()).toBe('#!a, b');
    });
  });

  describe('.difference()', () => {
    it('should create a new synset with values missing in the other one', () => {
      const synset1 = anEmptySynset().add(['a', 'b']);
      const synset2 = anEmptySynset().add(['b', 'c']);
      const difference = synset1.difference(synset2);

      expect(difference).not.toBe(synset1);
      expect(difference).not.toBe(synset2);
      expect(difference.toString()).toBe('!a');
    });

    it('should always take the worst-case metadata', () => {
      const synset1 = anEmptySynset().add(['a', 'b']);
      const synset2 = anEmptySynset();
      synset1.verified = false;
      synset1.debatable = true;

      const union = synset1.difference(synset2);
      expect(union.toString()).toBe('#!a, b');
    });
  });

  describe('.intersection()', () => {
    it('should return an empty synset if there is no intersection', () => {
      const s1 = anEmptySynset().add('lemma1');
      const s2 = anEmptySynset().add('lemma2');

      expect(s1.intersection(s2).toString()).toBe('!');
    });

    it('should return a non-empty synset if there is an intersection', () => {
      const s1 = anEmptySynset().add(['this', 'lemma']);
      const s2 = anEmptySynset().add(['that', 'lemma']);

      s1.verified = s2.verified = true;
      s2.debatable = true;

      expect(s1.intersection(s2).toString()).toBe('#lemma');
    });
  });

  describe('.lemmas()', () => {
    it('should iterate over lemmas across lemmas', () => {
      const { lemmas, synset } = aComplexSynset();
      expect(synset.lemmas).toEqual(lemmas);
    });
  });

  describe('when stringified', () => {
    it('should prepend ! if it is not verified', () => {
      const { synset } = aComplexSynset();
      synset.verified = false;
      synset.debatable = false;

      expect(`${synset}`).toMatch(/^!/);
    });

    it('should not prepend ! if it is verified', () => {
      const { synset } = aComplexSynset();
      synset.verified = true;
      synset.debatable = false;

      expect(`${synset}`).not.toMatch(/^!/);
    });

    it('should prepend # if it is debatable', () => {
      const { synset } = aComplexSynset();
      synset.debatable = true;
      synset.verified = true;

      expect(`${synset}`).toMatch(/^#[^!]/);
    });

    it('should not prepend # if it is not debatable', () => {
      const { synset } = aComplexSynset();
      synset.debatable = false;
      synset.verified = false;

      expect(`${synset}`).not.toMatch(/^#/);
    });

    it('should prepend both #! if it is verified and debatable', () => {
      const { synset } = aComplexSynset();
      synset.verified = false;
      synset.debatable = true;

      expect(`${synset}`).toMatch(/^#!/);
    });

    it('should separate lemmas with (;) and lemmas with (,) inside', () => {
      const synset = anEmptySynset();
      synset.add('toj, ktory rabi');
      synset.add('rabotajuci');
      synset.lemmas[0].annotations.push('adj.');

      expect(`${synset}`).toBe('!toj, ktory rabi (adj.); rabotajuci');
    });
  });

  describe('#parse()', () => {
    test.each([
      ['', void 0],
      ['!', void 0],
      ['#', void 0],
      ['#!', void 0],
      ['!#', '#!'],
      ['!#course', '#!course'],
      ['!U-Boot', void 0],
      ['#co-worker', void 0],
      ['#!only, ĝuste nun', void 0],
      ["з'явитися", void 0],
      ['сей (устар.; местоим.)', void 0],
      ['за (напр.: по грибы, за хлебом), по', void 0],
      ['bring (up) to', void 0],
      ['и; а зато (смысл2)', 'и, а зато (смысл2)'],
      // ['Добрий ранок!, Доброго ранку!', void 0],
    ])('should parse synset: %s', (value: string, expectedValue?: string) => {
      const synset = Synset.parse(value);
      expect(synset).toMatchSnapshot('synset');
      expect(`${synset}`).toBe(expectedValue ?? value);
    });
  });

  function aComplexSynset() {
    const lemma1 = new Lemma({ value: 'you' });
    const lemma2 = new Lemma({ value: 'thou', annotations: ['obsolete'] });
    const lemma3 = new Lemma({ value: 'lupus', annotations: ['medical'] });
    const lemmas = [lemma1, lemma2, lemma3];

    const verified = true;
    const debatable = true;

    return {
      synset: new Synset({ lemmas, debatable, verified }),
      meta: {
        verified,
        debatable,
      },
      lemmas,
      annotations: ['obsolete', 'medical'],
    };
  }

  function anEmptySynset() {
    return new Synset();
  }
});
