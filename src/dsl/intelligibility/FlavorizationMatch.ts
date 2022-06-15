import { FlavorizationIntermediate } from '../../customization';
import { FlavorizationDistance } from './FlavorizationDistance';

export type FlavorizationMatch = {
  interslavic: FlavorizationIntermediate;
  national: FlavorizationIntermediate;
  distance: FlavorizationDistance;
};
