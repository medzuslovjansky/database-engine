import { z } from 'zod';

export const rebuildProjectionsCommandPayloadSchema = z.object({
  clearTables: z.boolean().optional(),
  projectionNames: z.array(z.string()).optional(),
});

export type RebuildProjectionsCommandPayload = z.infer<typeof rebuildProjectionsCommandPayloadSchema>;
