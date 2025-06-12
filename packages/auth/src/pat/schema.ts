import { z } from 'zod';
import { AuthProviderLinkSchema } from '@auth/schema';

export const PATTokenSchema = z.object({
  id: z.string(),
  name: z.string()
});
export type PATTokenDTO = z.infer<typeof PATTokenSchema>;

export const PATTokenPrivateSchema = PATTokenSchema.extend({
  token: z.string()
});
export type PATTokenPrivateDTO = z.infer<typeof PATTokenPrivateSchema>;

export const PATTokenDetailedSchema = AuthProviderLinkSchema.extend({
  token_name: z.string()
});
export type PATTokenDetailed = z.infer<typeof PATTokenDetailedSchema>;