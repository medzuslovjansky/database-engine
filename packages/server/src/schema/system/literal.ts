import { z } from 'zod';
import { textSchema, nullableText } from '../base';

export const literalSchema = z.object({
  id: textSchema,
  type: textSchema,
  description: nullableText
});

export type Literal = z.infer<typeof literalSchema>;
