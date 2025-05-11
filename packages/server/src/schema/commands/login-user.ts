import { z } from 'zod';

export const loginUserCommandPayloadSchema = z.object({
  email: z.string().email(),
  display_name: z.string().min(1).regex(/\p{Letter}/u, "Display name must contain at least one letter"),
});

export type LoginUserCommandPayload = z.infer<typeof loginUserCommandPayloadSchema>;
