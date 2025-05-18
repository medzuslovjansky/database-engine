import { z } from 'zod';
import { BCP47LanguageCodeSchema, IntelligibilityMarkSchema } from '@core/primitives';

export const IntelligibilityRatedEventSchema = z.object({
  id: z.number(),
  lemma: z.string(),
  rated_by: z.string(),
  source_language: BCP47LanguageCodeSchema,
  target_language: BCP47LanguageCodeSchema,
  mark: IntelligibilityMarkSchema,
  cognates: z.array(z.string()).optional(),
  helper_words: z.array(z.string()).optional(),
  false_friends: z.array(z.string()).optional(),
  comment: z.string().optional(),
});

export type IntelligibilityRatedPayload = z.infer<
  typeof IntelligibilityRatedEventSchema
>;
