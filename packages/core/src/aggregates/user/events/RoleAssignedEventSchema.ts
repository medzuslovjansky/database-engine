import { z } from 'zod';

export const RoleAssignedEventDataSchema = z.object({
  user_id: z.string().uuid(),
  role: z.string().min(1),
  issuer_id: z.string().uuid(),
});

export type RoleAssignedEventData = z.infer<typeof RoleAssignedEventDataSchema>;
