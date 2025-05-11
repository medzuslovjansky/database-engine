import { z } from 'zod';
import { textSchema } from '../base';

export const featureSchema = z.object({
  id: textSchema
});

export type Feature = z.infer<typeof featureSchema>;
