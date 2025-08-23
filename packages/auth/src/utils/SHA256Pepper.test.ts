import { describe, it, expect } from 'vitest';

import { SHA256Pepper } from './SHA256Pepper';

describe('SHA256Pepper', () => {
  const testSecret = 'test-secret-123';
  const pepper = new SHA256Pepper({ secret: testSecret });

  describe('constructor', () => {
    it('should create instance with secret', () => {
      const instance = new SHA256Pepper({ secret: 'my-secret' });
      expect(instance).toBeInstanceOf(SHA256Pepper);
    });
  });

  describe('pepper', () => {
    it('should hash single string with secret', () => {
      const result = pepper.pepper('hello');
      expect(result).toBeTypeOf('string');
      expect(result).toHaveLength(64); // SHA256 hex string length
    });

    it('should hash multiple strings with secret', () => {
      const result = pepper.pepper('hello', 'world');
      expect(result).toBeTypeOf('string');
      expect(result).toHaveLength(64);
    });

    it('should hash empty strings with secret', () => {
      const result = pepper.pepper('');
      expect(result).toBeTypeOf('string');
      expect(result).toHaveLength(64);
    });

    it('should hash no strings (only secret)', () => {
      const result = pepper.pepper();
      expect(result).toBeTypeOf('string');
      expect(result).toHaveLength(64);
    });

    it('should produce consistent results for same input', () => {
      const result1 = pepper.pepper('hello', 'world');
      const result2 = pepper.pepper('hello', 'world');
      expect(result1).toBe(result2);
    });

    it('should produce different results for different inputs', () => {
      const result1 = pepper.pepper('hello');
      const result2 = pepper.pepper('world');
      expect(result1).not.toBe(result2);
    });

    it('should produce different results for different secrets', () => {
      const pepper1 = new SHA256Pepper({ secret: 'secret1' });
      const pepper2 = new SHA256Pepper({ secret: 'secret2' });

      const result1 = pepper1.pepper('hello');
      const result2 = pepper2.pepper('hello');

      expect(result1).not.toBe(result2);
    });

    it('should handle special characters in input', () => {
      const result = pepper.pepper('hello@world.com', 'user:123');
      expect(result).toBeTypeOf('string');
      expect(result).toHaveLength(64);
    });

    it('should handle unicode characters', () => {
      const result = pepper.pepper('привет', 'мир');
      expect(result).toBeTypeOf('string');
      expect(result).toHaveLength(64);
    });
  });
});
