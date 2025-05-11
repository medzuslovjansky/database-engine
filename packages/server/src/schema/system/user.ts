import { z } from 'zod';
import { textSchema } from '../base';

export const userSchema = z.object({
  id: textSchema,
  display_name: textSchema,
  email: textSchema,
  created_at: z.string().datetime().optional(),
  last_login: z.string().datetime().nullable()
});

export type User = z.infer<typeof userSchema>;
