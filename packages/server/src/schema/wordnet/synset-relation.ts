import { z } from 'zod';
import { textSchema } from '../base';

export const synsetRelationSchema = z.object({
  source_id: textSchema,
  target_id: textSchema,
  relation_type: textSchema
});

export type SynsetRelation = z.infer<typeof synsetRelationSchema>;
