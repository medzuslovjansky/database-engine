import { z } from 'zod';

export const UserCreatedEventDataSchema = z.object({
  user_id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().min(1),
  roles: z.array(z.string().min(1)),
});

export type UserCreatedEventData = z.infer<typeof UserCreatedEventDataSchema>;
