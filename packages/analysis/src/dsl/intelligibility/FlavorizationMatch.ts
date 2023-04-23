import type {
  LemmaIntermediate,
  FlavorizationIntermediate,
} from '../../customization';

import type { FlavorizationDistance } from './FlavorizationDistance';

export type FlavorizationMatch = {
  source: FlavorizationIntermediate;
  target: LemmaIntermediate;
  distance: FlavorizationDistance;
};
