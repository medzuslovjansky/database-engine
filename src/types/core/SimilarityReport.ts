import { WordsDTO } from '../words';
import { IntelligibilityDTO } from '../intellgibility';
import { Intermediate, Replacement } from '@interslavic/odometer';

type FlavorizationMatch = {
  distance: number;
  interslavic: IntelligibilityIntermediate;
  national: IntelligibilityIntermediate;
};

export type SimilarityReport = {
  id: string;
  least: FlavorizationMatch;
  average: FlavorizationMatch;
  most: FlavorizationMatch;
};

export type SimilarityParams = {
  words: WordsDTO;
  intelligibility: IntelligibilityDTO;
};

export class IntelligibilityIntermediate extends Intermediate<
  SimilarityParams,
  Replacement<SimilarityParams>
> {}
