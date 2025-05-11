import { z } from 'zod';

export const userCreatedEventSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  email: z.string().email(),
  created_at: z.number(),
  last_login: z.number(),
});

export type UserCreatedEvent = z.infer<typeof userCreatedEventSchema>;
