import { z } from 'zod';
import { textSchema } from '../base';

export const lemmaRelationSchema = z.object({
  source_id: textSchema,
  target_id: textSchema,
  relation_type: textSchema
});

export type LemmaRelation = z.infer<typeof lemmaRelationSchema>;
