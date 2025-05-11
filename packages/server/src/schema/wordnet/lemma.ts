import { z } from 'zod';
import { textSchema, nullableText } from '../base';

export const lemmaSchema = z.object({
  id: textSchema,
  source_type: nullableText,
  source_id: nullableText,
  value: textSchema,
  pos: textSchema,
  language_code: textSchema,
  metadata: nullableText
});

export type Lemma = z.infer<typeof lemmaSchema>;
