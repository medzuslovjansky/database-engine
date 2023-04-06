import type { UserConfig } from '../dto';

import { EncryptionVisitor } from './EncryptionVisitor';

const BASE64 = /[\d+/=A-Za-z]+/;

describe('EncryptionVisitor', () => {
  let visitor: EncryptionVisitor;

  beforeEach(() => {
    const key = '0123456789abcdef'.repeat(4);
    visitor = new EncryptionVisitor(key);
  });

  describe('visitUserConfig', () => {
    it('should encrypt the user email', () => {
      const user: UserConfig = { comment: 'Alice', email: 'alice@example.com' };

      visitor.visitUserConfig('alice', user);

      expect(user.email).not.toBe('alice@example.com');

      const expectedFormat = concatRegExp(BASE64, /\./, BASE64);
      expect(user.email).toMatch(expectedFormat);
    });

    it('should not encrypt the user email if it is empty', () => {
      const user: UserConfig = { comment: 'Bob', email: '' };
      visitor.visitUserConfig('bob', user);
      expect(user.email).toBe('');
    });
  });
});

function concatRegExp(...patterns: RegExp[]) {
  return new RegExp(`^${patterns.map((p) => p.source).join('')}$`);
}
