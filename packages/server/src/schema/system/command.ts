import { z } from 'zod';
import { textSchema, dateSchema, nullableText } from '../base';

export const commandSchema = z.object({
  id: z.number().optional(), // AUTOINCREMENT
  aggregate_id: nullableText,
  type: textSchema,
  created_at: dateSchema,
  actor: nullableText,
  executed_at: z.number().nullable(),
  status_code: z.number().nullable(),
  error_message: nullableText,
  result: nullableText,
  payload: textSchema
});

export type Command = z.infer<typeof commandSchema>;
