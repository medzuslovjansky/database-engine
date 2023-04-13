import type { User } from '../dto';

import { EncryptionVisitor } from './EncryptionVisitor';

const BASE64 = /[\d+/=A-Za-z]+/;

describe('EncryptionVisitor', () => {
  let visitor: EncryptionVisitor;

  beforeEach(() => {
    const key = '0123456789abcdef'.repeat(4);
    visitor = new EncryptionVisitor(key);
  });

  describe('visitUser', () => {
    it('should encrypt the user email', () => {
      const user: User = {
        id: 'alice',
        comment: 'Alice',
        email: 'alice@example.com',
      };

      visitor.visitUser(user);

      expect(user.email).not.toBe('alice@example.com');

      const expectedFormat = concatRegExp(BASE64, /\./, BASE64);
      expect(user.email).toMatch(expectedFormat);
    });

    it('should not encrypt the user email if it is empty', () => {
      const user: User = { id: 'bob', comment: 'Bob', email: '' };
      visitor.visitUser(user);
      expect(user.email).toBe('');
    });
  });
});

function concatRegExp(...patterns: RegExp[]) {
  return new RegExp(`^${patterns.map((p) => p.source).join('')}$`);
}
