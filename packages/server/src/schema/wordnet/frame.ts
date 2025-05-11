import { z } from 'zod';
import { textSchema, nullableText, jsonSchema } from '../base';

export const frameSchema = z.object({
  id: textSchema,
  name: textSchema,
  frame_data: jsonSchema,
  description: nullableText
});

export type Frame = z.infer<typeof frameSchema>;
