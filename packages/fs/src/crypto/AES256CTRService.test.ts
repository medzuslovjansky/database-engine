import { AES256CTRService } from './AES256CTRService';

const BASE64 = /[\d+/=A-Za-z]+/;

describe('AES256CTRService', () => {
  let helper: AES256CTRService;

  beforeEach(() => {
    const key = '0123456789abcdef'.repeat(4);
    helper = new AES256CTRService(key);
  });

  describe('encrypt', () => {
    it('should encrypt a string', () => {
      const expectedFormat = concatRegExp(BASE64, /\./, BASE64);
      expect(helper.encrypt('alice@example.com')).toMatch(expectedFormat);
    });

    it('should not encrypt a string if it is empty', () => {
      expect(helper.encrypt('')).toBe('');
    });
  });

  describe('decrypt', () => {
    it('should decrypt a string', () => {
      const encryptedEmail =
        'z1Tl2UWn0+ajbaC2LcErFg==.qNMXgFcB3/MT1TsJXva972s=';

      expect(helper.decrypt(encryptedEmail)).toBe('alice@example.com');
    });

    it('should not decrypt a string if it is empty', () => {
      const email = '';
      expect(helper.decrypt(email)).toBe('');
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a string', () => {
      const email = 'bob@example.com';
      const encryptedEmail = helper.encrypt(email);
      expect(helper.decrypt(encryptedEmail)).toBe(email);
    });
  });
});

function concatRegExp(...patterns: RegExp[]) {
  return new RegExp(`^${patterns.map((p) => p.source).join('')}$`);
}
