import { z } from 'zod';
import { textSchema } from '../base';

export const userRoleSchema = z.object({
  user_id: textSchema,
  role_id: textSchema,
  language_code: textSchema.default('mul')
});

export type UserRole = z.infer<typeof userRoleSchema>;
