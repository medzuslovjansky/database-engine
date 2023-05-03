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

    describe('parsed from a string', () => {
      beforeEach(() => {
        lemma = Lemma.parse('');
      });

      test.each([
        'běguči',
        'око (устар.)',
        'той, що біжить',
        'bring (up) on (colloq.; slang)',
      ])('%j should be stringified to the same form', (testString) => {
        const lemma = Lemma.parse(testString);
        expect(lemma).toMatchSnapshot();
        expect(`${lemma}`).toBe(testString);
      });

      it('should ignore empty annotations', () => {
        const lemma = Lemma.parse('pråzdne anotacije ()');
        expect(lemma.value).toBe('pråzdne anotacije');
        expect(lemma.annotations).toEqual([]);
        expect(`${lemma}`).toBe('pråzdne anotacije');
      });

      test.each([
        'zabezpamečena lěva zatvorka)',
        'zabezpamečena prava zatvorka (',
        'měšane ) zatvorky (',
      ])(
        'should throw an error if there are unbalanced brackets',
        (testString) => {
          expect(() => Lemma.parse(testString)).toThrow(
            /incorrect parentheses/,
          );
        },
      );
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
