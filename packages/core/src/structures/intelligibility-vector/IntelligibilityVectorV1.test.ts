import { IntelligibilityVectorV1 } from './IntelligibilityVectorV1';
import { Language } from '../../constants';
import { IntelligibilityMark } from '../../primitives';

describe('IntelligibilityVectorV1', () => {
  const UK = 'uk' as Language;
  const BG = 'bg' as Language;
  const PL = 'pl' as Language;

  describe('creation and parsing', () => {
    test('parses string format into correct values', () => {
      const vec = IntelligibilityVectorV1.fromString('uk+ bg- pl~');
      expect(vec.getValue(UK)).toBe(1);
      expect(vec.getValue(BG)).toBe(0);
      expect(vec.getValue(PL)).toBe(0.5);
    });

    test('fromString produces consistent results', () => {
      const vec = IntelligibilityVectorV1.fromString('uk+ bg- pl~');
      const vec2 = IntelligibilityVectorV1.fromString('uk+ bg- pl~');
      expect(vec2.getValue(UK)).toBe(vec.getValue(UK));
      expect(vec2.getValue(BG)).toBe(vec.getValue(BG));
      expect(vec2.getValue(PL)).toBe(vec.getValue(PL));
    });

    test('handles unknown language codes gracefully', () => {
      const vecUnknown = IntelligibilityVectorV1.fromString('xx+');
      expect(vecUnknown.getValue('xx' as Language)).toBe(1);
    });
  });

  describe('serialization', () => {
    test('toString outputs languages in alphabetical order', () => {
      const vec = IntelligibilityVectorV1.fromString('uk+ bg- pl~');
      expect(vec.toString()).toBe('bg- pl~ uk+');
    });
  });

  describe('update operations', () => {
    test('sets intelligibility marks to correct values', () => {
      const vec = IntelligibilityVectorV1.empty();
      vec.update(UK, '.' as IntelligibilityMark);
      expect(vec.getValue(UK)).toBe(1);
      vec.update(BG, 'n' as IntelligibilityMark);
      expect(vec.getValue(BG)).toBe(0);
      vec.update(PL, 't' as IntelligibilityMark);
      expect(vec.getValue(PL)).toBe(0.25);
    });

    test('overwrites existing language values', () => {
      const vec = IntelligibilityVectorV1.fromString('uk+');
      vec.update(UK, 'n' as IntelligibilityMark);
      expect(vec.getValue(UK)).toBe(0);
    });

    test('removes language entry when mark is undefined', () => {
      const vec = IntelligibilityVectorV1.fromString('uk+ bg- pl~');
      vec.update(UK, undefined);
      expect(vec.getValue(UK)).toBeUndefined();
      expect(vec.toString()).toBe('bg- pl~');
      expect(vec.getValue(BG)).toBe(0);
      expect(vec.getValue(PL)).toBe(0.5);
    });

    test('clone creates a deep copy of the vector', () => {
      const original = IntelligibilityVectorV1.fromString('uk+ bg- pl~');
      const clone = original.clone();
      expect(clone).not.toBe(original);
      expect(clone.equals(original)).toBe(true);
      clone.update(UK, 'n' as IntelligibilityMark);
      expect(clone.getValue(UK)).toBe(0);
      expect(original.getValue(UK)).toBe(1);
    });
  });
});
