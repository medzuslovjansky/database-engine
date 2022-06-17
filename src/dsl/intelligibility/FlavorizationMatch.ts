import {
  LemmaIntermediate,
  FlavorizationIntermediate,
} from '../../customization';

import { FlavorizationDistance } from './FlavorizationDistance';

export type FlavorizationMatch = {
  source: FlavorizationIntermediate;
  target: LemmaIntermediate;
  distance: FlavorizationDistance;
};
