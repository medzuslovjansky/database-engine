import { z } from 'zod';

import { BCP47LanguageCodeSchema, UserIdSchema, UserRoleSchema } from './entities';

export const PaginationQuerySchema = z.object({
	index: z.coerce.number().int().min(0).default(0),
	size: z.coerce.number().int().min(1).max(100).default(20),
});

export const ListUsersRequestSchema = PaginationQuerySchema;

export const GetUserRequestSchema = z.object({
	userId: UserIdSchema,
});

export const AssignRoleRequestSchema = z.object({
  userId: UserIdSchema,
  issuerId: UserIdSchema,
  role: UserRoleSchema,
  language: BCP47LanguageCodeSchema.optional(),
});

export const UnassignRoleRequestSchema = AssignRoleRequestSchema;

// TypeScript types
export type ListUsersRequest = z.infer<typeof ListUsersRequestSchema>;
export type GetUserRequest = z.infer<typeof GetUserRequestSchema>;
export type AssignRoleRequest = z.infer<typeof AssignRoleRequestSchema>;
export type UnassignRoleRequest = z.infer<typeof UnassignRoleRequestSchema>;
