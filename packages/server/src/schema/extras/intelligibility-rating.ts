import { z } from 'zod';
import { textSchema, nullableText } from '../base';

export const intelligibilityRatingSchema = z.object({
  id: textSchema,
  meaning_id: textSchema,
  source_language_code: textSchema,
  target_language_code: textSchema,
  intelligibility_level: textSchema,
  user_id: textSchema,
  added_at: z.string().datetime().optional(),
  last_updated: z.string().datetime().optional(),
  notes: nullableText
});

export type IntelligibilityRating = z.infer<typeof intelligibilityRatingSchema>;