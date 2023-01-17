import { GIDs, NATURAL_LANGUAGES } from '../utils/constants';

export type SyncOptions = {
  readonly setPermissions: boolean;
  readonly download: Array<keyof typeof GIDs>;
  readonly flavorize: Array<keyof typeof NATURAL_LANGUAGES>;
  readonly analyze: Array<keyof typeof NATURAL_LANGUAGES>;
  readonly upload: Array<keyof typeof GIDs>;

  readonly force: Array<'analyze' | 'flavorize'>;
  readonly overwriteCache: Array<keyof typeof GIDs>;
};
