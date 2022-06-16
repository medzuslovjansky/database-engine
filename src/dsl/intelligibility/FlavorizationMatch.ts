import { FlavorizationIntermediate } from '../../customization';
import { FlavorizationDistance } from './FlavorizationDistance';

export type FlavorizationMatch = {
  source: FlavorizationIntermediate;
  target: FlavorizationIntermediate;
  distance: FlavorizationDistance;
};
