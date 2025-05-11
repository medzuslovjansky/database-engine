import { z } from 'zod';

export const steenEntryRemovedEventSchema = z.object({
  id: z.number(), // required, will be Math.abs(id) in logic
  source: z.string().optional(),
});

export type SteenEntryRemovedEvent = z.infer<typeof steenEntryRemovedEventSchema>;
