import { z } from 'zod';

export const USER_ROLES = [
  'admin',
  'curator',
  'speaker',
  'editor',
] as const;

export const UserRoleSchema = z.enum(USER_ROLES);

export type UserRole = (typeof USER_ROLES)[number];
