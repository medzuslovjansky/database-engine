import type { UserConfig } from '../dto';

import { DecryptionVisitor } from './DecryptionVisitor';

describe('DecryptionVisitor', () => {
  let visitor: DecryptionVisitor;

  beforeEach(() => {
    const key = '0123456789abcdef'.repeat(4);
    visitor = new DecryptionVisitor(key);
  });

  describe('visitUserConfig', () => {
    it('should decrypt the user email', () => {
      const encryptedEmail =
        'z1Tl2UWn0+ajbaC2LcErFg==.qNMXgFcB3/MT1TsJXva972s=';
      const user: UserConfig = { comment: 'Alice', email: encryptedEmail };

      visitor.visitUserConfig('alice', user);
      expect(user.email).toBe('alice@example.com');
    });

    it('should not decrypt the user email if it is empty', () => {
      const user: UserConfig = { comment: 'Bob', email: '' };
      visitor.visitUserConfig('bob', user);
      expect(user.email).toBe('');
    });
  });
});
