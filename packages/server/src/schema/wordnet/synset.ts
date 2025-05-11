import { z } from 'zod';
import { textSchema, nullableText } from '../base';

export const synsetSchema = z.object({
  id: textSchema,
  source_type: nullableText,
  source_id: nullableText,
  domain_id: z.number().nullable(),
  definition: nullableText
});

export type Synset = z.infer<typeof synsetSchema>;
