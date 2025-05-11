import { z } from 'zod';
import { textSchema } from '../base';

export const featureValueSchema = z.object({
  id: textSchema,
  feature_id: textSchema
});

export type FeatureValue = z.infer<typeof featureValueSchema>;
