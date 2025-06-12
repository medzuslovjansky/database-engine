import { z } from 'zod';

export const D1MigrationRecordSchema = z.object({
  id: z.number(),
  name: z.string(),
  applied_at: z.number(),
  batch: z.number()
});

export type D1MigrationRecordDTO = z.infer<typeof D1MigrationRecordSchema>;