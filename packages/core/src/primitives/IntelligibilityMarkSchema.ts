import { z } from 'zod';

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

export type IntelligibilityMark = z.infer<typeof IntelligibilityMarkSchema>;
