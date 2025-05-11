import { z } from 'zod';

export const SteenEntryRemovedEventSchema = z.object({
  id: z.number(),
});

export type SteenEntryRemovedEvent = z.infer<
  typeof SteenEntryRemovedEventSchema
>;
