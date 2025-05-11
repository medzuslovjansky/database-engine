import { z } from 'zod';
import { textSchema } from '../base';

export const relationTypeSchema = z.object({
  id: textSchema
});

export type RelationType = z.infer<typeof relationTypeSchema>;
