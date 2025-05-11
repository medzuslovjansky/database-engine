import { z } from 'zod';
import { roleSchema } from '../literals';

export const addUserRoleCommandPayloadSchema = z.object({
  user_id: z.string(),
  role: roleSchema,
  language_code: z.string().optional(),
});

export type AddUserRoleCommandPayload = z.infer<typeof addUserRoleCommandPayloadSchema>;
