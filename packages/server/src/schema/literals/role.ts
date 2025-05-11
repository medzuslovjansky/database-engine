import { z } from 'zod';

export const allowedRoles = [
  'admin',
  'language_curator',
  'synset_editor',
  'translator',
  'intelligibility_rater',
] as const;

export const roleSchema = z.enum(allowedRoles);

export type Role = (typeof allowedRoles)[number];
