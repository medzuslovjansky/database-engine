import { describe, it, expect } from 'vitest';

import { SlovosborError } from '../errors';
import { en } from './index';

describe('en', () => {
  it('should return the correct error message', () => {
    const message = en.getErrorMessage(new SlovosborError('test', { key: 'value' }));
    expect(message).toBe('Slovosbor error: {"key":"value"}');
  });
});
