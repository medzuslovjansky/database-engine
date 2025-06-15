import { z } from 'zod';

export const AuthProviderTypeSchema = z.enum(['google', 'pat']);
export type AuthProviderType = z.infer<typeof AuthProviderTypeSchema>;

export const AuthProviderLinkSchema = z.object({
  provider_type: AuthProviderTypeSchema,
  provider_id: z.string(),
  user_id: z.string(),
  created_at: z.number(),
  last_login_at: z.number().optional()
});
export type AuthProviderLinkDTO = z.infer<typeof AuthProviderLinkSchema>;

export const UserProfileSchema = z.object({
  id: z.string(),
  display_name: z.string().optional(),
  avatar_url: z.string().optional(),
  email: z.string().optional(),
  last_login_at: z.number().optional(),
  provider_link: AuthProviderLinkSchema.optional()
});
export type UserProfileDTO = z.infer<typeof UserProfileSchema>;

