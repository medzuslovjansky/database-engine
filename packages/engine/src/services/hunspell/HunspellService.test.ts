import { HunspellService } from './HunspellService';
import { SpellCheckedText } from './SpellCheckedText';

describe('HunspellService', () => {
  let service: HunspellService;

  beforeAll(async () => {
    service = await HunspellService.for('test');
  });

  describe('initialization', () => {
    it('should initialize with a test dictionary', async () => {
      expect(service).toBeInstanceOf(HunspellService);
      expect(service.language).toBe('test');
      expect(service.markers).toEqual(['{', '}', '|']);
    });

    it('should throw error for invalid language', async () => {
      await expect(HunspellService.for('invalid-lang')).rejects.toThrow(
        'No Hunspell dictionary found for language invalid-lang'
      );
    });
  });

  describe('check', () => {
    it('should return an instance of SpellCheckedText', async () => {
      const text = 'for';
      const result = await service.check(text);

      expect(result).toBeInstanceOf(SpellCheckedText);
      expect(result.toString()).toBe(text);
    });

    it('should mark misspelled words', async () => {
      const text = 'Ed walked for a morning run in Chicago';
      const result = await service.check(text);

      expect(result).toBeInstanceOf(SpellCheckedText);
      expect(result.toString()).toBe('{Ed} walked for a {morning} run in {Chicago}');
    });

    it('should handle text with correct spelling', async () => {
      const text = 'For a run';
      const result = await service.check(text);

      expect(result.toString()).toBe('For a run');
    });

    it('should handle text with punctuation', async () => {
      const text = '¿Qué es esto?';
      const result = await service.check(text);

      expect(result.toString()).toBe('¿{Qué} {es} {esto}?');
    });

    it('should handle empty text', async () => {
      const text = '';
      const result = await service.check(text);

      expect(result.toString()).toBe('');
    });
  });

  describe('custom markers', () => {
    it('should use custom markers when provided', async () => {
      const customService = await HunspellService.for('test', { markers: ['*', '*', '/'] });
      const text = 'Ed walked.';
      const result = await customService.check(text);

      expect(result.toString()).toBe('*Ed* walked.');
    });
  });
});
