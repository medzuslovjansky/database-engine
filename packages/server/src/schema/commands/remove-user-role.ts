import { z } from 'zod';
import { roleSchema } from '../literals';

export const removeUserRoleCommandPayloadSchema = z.object({
  user_id: z.string(),
  role: roleSchema,
  language_code: z.string().optional(),
});

export type RemoveUserRoleCommandPayload = z.infer<typeof removeUserRoleCommandPayloadSchema>;
