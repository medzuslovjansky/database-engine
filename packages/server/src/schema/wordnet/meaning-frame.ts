import { z } from 'zod';
import { textSchema, nullableText, jsonSchema } from '../base';

export const meaningFrameSchema = z.object({
  meaning_id: textSchema,
  frame_id: textSchema,
  realization_data: jsonSchema,
  examples: nullableText
});

export type MeaningFrame = z.infer<typeof meaningFrameSchema>;
