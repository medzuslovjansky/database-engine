import { z } from 'zod';

export const RoleUnassignedEventDataSchema = z.object({
  user_id: z.string().uuid(),
  role: z.string().min(1),
  issuer_id: z.string().uuid(),
});

export type RoleUnassignedEventData = z.infer<
  typeof RoleUnassignedEventDataSchema
>;
