import { z } from 'zod';

export const UserCreatedEventDataSchema = z.object({
  user_id: z.string().uuid(),
});

export type UserCreatedEventData = z.infer<typeof UserCreatedEventDataSchema>;
