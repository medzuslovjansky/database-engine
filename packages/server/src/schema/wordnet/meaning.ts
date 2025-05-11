import { z } from 'zod';
import { textSchema, nullableText } from '../base';

export const meaningSchema = z.object({
  id: textSchema,
  synset_id: textSchema,
  lemma_id: textSchema,
  sense_number: z.number().nullable(),
  annotation: nullableText
});

export type Meaning = z.infer<typeof meaningSchema>;
