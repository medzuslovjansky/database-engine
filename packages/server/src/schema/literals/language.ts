import { z } from 'zod';
import { textSchema, nullableText } from '../base';

export const languageSchema = z.object({
  code: textSchema,
  parent_code: nullableText
});

export type Language = z.infer<typeof languageSchema>;
