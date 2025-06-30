import { EmptyIdError, EmptyAggregateTypeError, InvalidStreamIdFormatError } from '../errors';

import { StreamIdentifier } from './StreamIdentifier';

describe('StreamIdentifier', () => {
  describe('constructor', () => {
    test('should create a valid StreamIdentifier with prefix and id', () => {
      const stream = new StreamIdentifier('user', '123');
      expect(stream.prefix).toBe('user');
      expect(stream.id).toBe('123');
    });

    test('should throw EmptyAggregateTypeError when prefix is empty', () => {
      expect(() => new StreamIdentifier('', '123')).toThrow(EmptyAggregateTypeError);
    });

    test('should throw EmptyIdError when id is empty', () => {
      expect(() => new StreamIdentifier('user', '')).toThrow(EmptyIdError);
    });
  });

  describe('fromString', () => {
    test('should create a valid StreamIdentifier from properly formatted string', () => {
      const stream = StreamIdentifier.fromString('user/123');
      expect(stream.prefix).toBe('user');
      expect(stream.id).toBe('123');
    });

    test('should throw InvalidStreamIdFormatError when format is invalid', () => {
      expect(() => StreamIdentifier.fromString('invalidformat')).toThrow(InvalidStreamIdFormatError);
      expect(() => StreamIdentifier.fromString('too/many/parts')).toThrow(InvalidStreamIdFormatError);
    });
  });

  describe('toString', () => {
    test('should return the correct string representation', () => {
      const stream = new StreamIdentifier('account', 'abc-def');
      expect(stream.toString()).toBe('account/abc-def');
    });
  });

  describe('equals', () => {
    test('should return true when comparing identical StreamIdentifiers', () => {
      const stream1 = new StreamIdentifier('user', '123');
      const stream2 = new StreamIdentifier('user', '123');
      expect(stream1.equals(stream2)).toBe(true);
    });

    test('should return false when comparing different StreamIdentifiers', () => {
      const stream1 = new StreamIdentifier('user', '123');
      const stream2 = new StreamIdentifier('user', '456');
      const stream3 = new StreamIdentifier('account', '123');
      expect(stream1.equals(stream2)).toBe(false);
      expect(stream1.equals(stream3)).toBe(false);
    });
  });
});
