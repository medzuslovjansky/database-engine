import { z } from 'zod';

export const BCP47LanguageCodeSchema = z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/);

export type BCP47LanguageCode = z.infer<typeof BCP47LanguageCodeSchema>;