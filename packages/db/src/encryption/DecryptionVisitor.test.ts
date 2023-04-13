import type { User } from '../dto';

import { DecryptionVisitor } from './DecryptionVisitor';

describe('DecryptionVisitor', () => {
  let visitor: DecryptionVisitor;

  beforeEach(() => {
    const key = '0123456789abcdef'.repeat(4);
    visitor = new DecryptionVisitor(key);
  });

  describe('visitUser', () => {
    it('should decrypt the user email', () => {
      const encryptedEmail =
        'z1Tl2UWn0+ajbaC2LcErFg==.qNMXgFcB3/MT1TsJXva972s=';
      const user: User = {
        id: 'alice',
        comment: 'Alice',
        email: encryptedEmail,
      };

      visitor.visitUser(user);
      expect(user.email).toBe('alice@example.com');
    });

    it('should not decrypt the user email if it is empty', () => {
      const user: User = { id: 'bob', comment: 'Bob', email: '' };
      visitor.visitUser(user);
      expect(user.email).toBe('');
    });
  });
});
