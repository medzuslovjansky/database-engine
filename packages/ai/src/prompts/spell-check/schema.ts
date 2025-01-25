import { Language } from '@interslavic/database-engine-core';
import { z } from 'zod';

export interface SpellCheckRequest {
  language: Language;
  partOfSpeech: string;
  english: string;
  translation: string;
}

export const SpellCheckResponseSchema = z.object({
  corrections: z.string().optional(),
  confidence: z.number().min(0).max(1),
  explanation: z.string().optional()
});

export type SpellCheckResponse = z.infer<typeof SpellCheckResponseSchema>;
