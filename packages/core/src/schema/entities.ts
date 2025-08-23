import { z } from 'zod';

export const UserIdSchema = z.string().uuid();

export const BCP47LanguageCodeSchema = z.string().regex(/^[a-z]{2,3}(-[\dA-Za-z]+)*$/);

export const IntelligibilityMarkSchema = z.enum([
  '.',  // Fully intelligible (word is completely understandable in context)
  'n',  // Not intelligible (word is incomprehensible to native speakers)
  't',  // Difficult (word may be unintelligible or hard to understand)
  'r',  // Rare (rarely used word - slang, technical, historical - people with limited vocabulary may not know it)
  'z',  // Obsolete (word is completely outdated/obsolete, incomprehensible)
  'a',  // Archaic (archaic word - people with limited vocabulary may not understand it)
  'f',  // False friend (similar word but with different meaning, which is confusing)
  'k',  // Contextual (word has slightly different but related meaning - understanding depends on context)
  'm',  // Intuitive (word doesn't exist in the language but is intuitively understandable in context for thinking persons)
  '?',  // Unmarked (intelligibility is not marked, e.g. errors in dictionary)
]);

export const USER_ROLES = [
  'admin',
  'curator',
  'speaker',
  'editor',
] as const;

export const UserRoleSchema = z.enum(USER_ROLES);

//#region Types

export type UserId = z.infer<typeof UserIdSchema>;
export type BCP47LanguageCode = z.infer<typeof BCP47LanguageCodeSchema>;
export type IntelligibilityMark = z.infer<typeof IntelligibilityMarkSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;

//#endregion
