import { Role } from "./Role";

/**
 * UserRole with matching functionality
 */
export class UserRole {
  constructor(private readonly _role: Role, private readonly _language = 'mul') {}

  get language(): string {
    return this._language;
  }

  /**
   * Check if this role matches the specified role and language
   */
  matches(role: Role, languageCode = 'mul'): boolean {
	if (this._language === 'mul' || this._language === languageCode) {
		return this._includes(role);
	}

	return false;
  }

  _includes(role: Role): boolean {
	if (this._role === role) return true;
	if (this._role === 'admin') return true;
	if (this._role === 'language_curator') return (role === 'translator' || role === 'intelligibility_rater');
	return false;
  }

  toJSON() {
	return {
		role: this._role,
		language: this._language
	};
  }
}
