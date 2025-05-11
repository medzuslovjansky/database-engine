import { z } from 'zod';
import { textSchema } from '../base';

export const lemmaFeatureSchema = z.object({
  lemma_id: textSchema,
  feature_id: textSchema,
  feature_value_id: textSchema
});

export type LemmaFeature = z.infer<typeof lemmaFeatureSchema>;
