import { z } from 'zod';

export const userRoleRemovedEventSchema = z.object({
  user_id: z.string(),
  role: z.string(),
  language_code: z.string().optional(),
});

export type UserRoleRemovedEvent = z.infer<typeof userRoleRemovedEventSchema>;
