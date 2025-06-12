import { z } from 'zod';
import {BCP47LanguageCodeSchema, UserRoleSchema} from '@core/primitives';

export const RoleUnassignedEventDataSchema = z.object({
  user_id: z.string().uuid(),
  issuer_id: z.string().uuid(),
  role: UserRoleSchema,
  language: BCP47LanguageCodeSchema.optional(),
});

export type RoleUnassignedEventData = z.infer<
  typeof RoleUnassignedEventDataSchema
>;
