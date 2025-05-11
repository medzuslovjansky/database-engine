import { z } from 'zod';
import { textSchema } from '../base';

export const translationSchema = z.object({
  literal_id: textSchema,
  literal_type: textSchema,
  language_code: textSchema,
  translation: textSchema
});

export type Translation = z.infer<typeof translationSchema>;
