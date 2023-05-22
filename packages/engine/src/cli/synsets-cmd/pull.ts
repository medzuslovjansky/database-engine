import { GSheets2Git } from '../../sync';
import type { WordsSheet } from '../../google';

import type { PullArgv } from './common';
import { getGoogleGitSyncPrerequisites } from './common';

export async function pull(argv: PullArgv) {
  const { fileDatabase, wordsSheet } = await getGoogleGitSyncPrerequisites();
  const sync = new GSheets2Git({
    beta: argv.beta,
    fs: fileDatabase.multisynsets,
    gsheets: wordsSheet as WordsSheet,
  });

  console.log('Fetching synsets...');
  await sync.execute();
}
