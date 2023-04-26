import { Lemma } from './Lemma';

describe('Lemma', () => {
  let lemma: Lemma;

  describe('when created', () => {
    describe('with no args', () => {
      beforeEach(() => {
        lemma = new Lemma();
      });

      it('should have an empty value', () => {
        expect(lemma.value).toBe('');
      });

      it('should have no annotations', () => {
        expect(lemma.annotations).toEqual([]);
      });
    });

    describe('with value and annotations', () => {
      beforeEach(() => {
        lemma = new Lemma({
          value: 'this',
          annotations: ['demonstrative'],
        });
      });

      it('should have that value', () => {
        expect(lemma.value).toBe('this');
      });

      it('should have those annotations', () => {
        expect(lemma.annotations).toEqual(['demonstrative']);
      });
    });
  });

  describe('when stringified', () => {
    it('should convert into its value if there are no annotations', () => {
      lemma = new Lemma({ value: 'and' });
      expect(`${lemma}`).toBe('and');
    });

    it('should convert into its value with annotations separated by ";" inside round brackets', () => {
      lemma = new Lemma({
        value: 'and',
        annotations: ['conj.', 'common'],
      });

      expect(`${lemma}`).toBe('and (conj.; common)');
    });
  });
});
