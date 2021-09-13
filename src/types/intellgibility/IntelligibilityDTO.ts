import { core } from '@interslavic/steen-utils';
import { CognateMatch } from './CognateMatch';

export type IntelligibilityDTO = {
  id: string;
  translations: core.Synset;
  helperWords: core.Synset;
  match: CognateMatch;
  Δmin: number;
  Δavg: number;
  Δmax: number;
  Rmin: number;
  Rmax: number;
  comments: string;
};
