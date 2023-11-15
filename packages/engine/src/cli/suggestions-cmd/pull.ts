import { ImportSuggestions } from '../../sync';

import type { PullArgv } from './common';
import { getGoogleGitSyncPrerequisites } from './common';

export async function pull(argv: PullArgv) {
  const { multisynsets, suggestions } = await getGoogleGitSyncPrerequisites();

  const selectedIds = argv._.slice(1);
  const operation = new ImportSuggestions({
    multisynsets,
    selectedIds,
    suggestions,
  });

  console.log('Importing suggestions...');
  await operation.execute();
}

export {type PullArgv} from './common';
