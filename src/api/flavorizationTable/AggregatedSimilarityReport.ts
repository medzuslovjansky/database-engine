import { FlavorizationMatch } from './FlavorizationMatch';

export type AggregatedSimilarityReport = {
  id: string;
  standard: FlavorizationMatch[];
  etymological: FlavorizationMatch[];
  mistaken: FlavorizationMatch[];
};
