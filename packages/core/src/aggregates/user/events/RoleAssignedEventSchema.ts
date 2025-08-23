import { z } from 'zod';
import {BCP47LanguageCodeSchema, UserRoleSchema} from '@core/schema';

export const RoleAssignedEventDataSchema = z.object({
  user_id: z.string().uuid(),
  issuer_id: z.string().uuid(),
  role: UserRoleSchema,
  language: BCP47LanguageCodeSchema.optional(),
});

export type RoleAssignedEventData = z.infer<typeof RoleAssignedEventDataSchema>;
