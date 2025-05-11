import { z } from 'zod';
import { textSchema, nullableText } from '../base';

export const domainSchema = z.object({
  id: z.number(),
  name: textSchema,
  upos: nullableText
});

export type Domain = z.infer<typeof domainSchema>;
