import { z } from 'zod';
import { textSchema } from '../base';

export const uposSchema = z.object({
  id: textSchema
});

export type Upos = z.infer<typeof uposSchema>;
