import { Role } from './Role';
import type { User } from './User';

/**
 * Checks if the acting user can edit roles for the target user.
 */
export function canEditUserRole(actingUser: User, targetRole: Role, languageCode = 'mul'): boolean {
	if (actingUser.hasRole('admin')) return true;

	if (targetRole === 'translator' || targetRole === 'intelligibility_rater' && languageCode !== 'mul') {
		return actingUser.hasRole('language_curator', languageCode);
	}

	return false;
}

/**
 * Checks if the user can edit translations for a given language.
 */
export function canEditTranslations(user: User, languageCode: string): boolean {
  return user.hasRole('translator', languageCode);
}

/**
 * Checks if the user can edit intelligibility ratings for a given language.
 */
export function canEditIntelligibilityRatings(user: User, languageCode: string): boolean {
	return user.hasRole('intelligibility_rater', languageCode);
}
