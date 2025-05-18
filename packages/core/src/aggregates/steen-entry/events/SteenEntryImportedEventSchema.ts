import { z } from 'zod';
import { BCP47LanguageCodeSchema } from '@core/primitives';

export const SteenEntryImportedEventSchema = z.object({
  id: z.number(), // required, will be Math.abs(id) in logic
  translations: z.record(BCP47LanguageCodeSchema, z.string()).optional(),
  additional_info: z.string().optional(),
  part_of_speech: z.string().optional(),
  type: z.number().min(0).max(99).optional(),
  same_in_languages: z.string().optional(),
  genesis: z.string().optional(),
  frequency: z.number().min(0).optional(),
  intelligibility: z.string().optional(),
  using_example: z.string().optional(),
});

export type SteenEntryImportedPayload = z.infer<
  typeof SteenEntryImportedEventSchema
>;
