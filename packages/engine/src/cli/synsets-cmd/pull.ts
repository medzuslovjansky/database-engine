import { GSheets2Git } from '../../sync';

import type { PullArgv } from './common';
import { getGoogleGitSyncPrerequisites } from './common';

export async function pull(argv: PullArgv) {
  const { multisynsets, words, wordsAddLang } =
    await getGoogleGitSyncPrerequisites();

  const sync = new GSheets2Git({
    beta: argv.beta,
    multisynsets,
    wordsAddLang,
    words,
  });

  console.log('Fetching synsets...');
  await sync.execute();
}
