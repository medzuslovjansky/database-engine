import { z } from 'zod';

export const userUpdatedEventSchema = z.object({
  id: z.string(),
  display_name: z.string(),
});

export type UserUpdatedEvent = z.infer<typeof userUpdatedEventSchema>;
