import { z } from 'zod';
import { textSchema } from '../base';

export const intelligibilityMarkSchema = z.object({
  id: textSchema
});

export type IntelligibilityMark = z.infer<typeof intelligibilityMarkSchema>;
