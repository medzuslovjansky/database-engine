import { z } from 'zod';

export const userRoleAddedEventSchema = z.object({
  user_id: z.string(),
  role: z.string(),
  language_code: z.string().optional(),
});

export type UserRoleAddedEvent = z.infer<typeof userRoleAddedEventSchema>;
