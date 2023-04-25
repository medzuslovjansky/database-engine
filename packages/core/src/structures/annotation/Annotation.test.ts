import { Annotation } from './Annotation';

describe('Annotation', () => {
  let annotation: Annotation;

  describe('when created', () => {
    describe('with no args', () => {
      beforeEach(() => {
        annotation = new Annotation();
      });

      it('should have an empty value', () => {
        expect(annotation.value).toBe('');
      });
    });

    describe('with value', () => {
      beforeEach(() => {
        annotation = new Annotation({
          value: 'арх.',
        });
      });

      it('should have that value', () => {
        expect(annotation.value).toBe('арх.');
      });
    });

    describe('via static method', () => {
      beforeEach(() => {
        annotation = Annotation.fromString('арх.');
      });

      it('should have that string value', () => {
        expect(annotation.value).toBe('арх.');
      });
    });
  });

  describe('when stringified', () => {
    beforeEach(() => {
      annotation = Annotation.fromString('conj.');
    });

    it('should convert into its value', () => {
      expect(`${annotation}`).toBe(annotation.value);
    });
  });
});
