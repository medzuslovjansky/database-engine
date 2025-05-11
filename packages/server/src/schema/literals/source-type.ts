import { z } from 'zod';
import { textSchema } from '../base';

export const sourceTypeSchema = z.object({
  id: textSchema
});

export type SourceType = z.infer<typeof sourceTypeSchema>;
