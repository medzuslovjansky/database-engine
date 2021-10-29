import { FlavorizationIntermediate } from './FlavorizationIntermediate';
import { FlavorizationDistance } from './FlavorizationDistance';

export type FlavorizationMatch = {
  interslavic: FlavorizationIntermediate;
  national: FlavorizationIntermediate;
  distance: FlavorizationDistance;
};
