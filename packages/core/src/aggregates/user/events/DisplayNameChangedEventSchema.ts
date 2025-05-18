import { z } from 'zod';

export const DisplayNameChangedEventDataSchema = z.object({
  user_id: z.string().uuid(),
  new_display_name: z.string().min(1),
});

export type DisplayNameChangedEventData = z.infer<
  typeof DisplayNameChangedEventDataSchema
>;
