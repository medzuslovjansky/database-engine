import { z } from 'zod';

export const updateUserCommandPayloadSchema = z.object({
  id: z.string(),
  display_name: z.string().min(1).regex(/\p{Letter}/u, "Display name must contain at least one letter"),
});

export type UpdateUserCommandPayload = z.infer<typeof updateUserCommandPayloadSchema>;
