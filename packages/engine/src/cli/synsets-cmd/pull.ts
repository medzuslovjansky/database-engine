import { GSheets2Git } from '../../sync';

import type { PullArgv } from './common';
import { getGoogleGitSyncPrerequisites, parseSelectedSynsets } from './common';

export async function pull(argv: PullArgv) {
  const { multisynsets, words, wordsAddLang } =
    await getGoogleGitSyncPrerequisites();

  const selectedIds = await parseSelectedSynsets(multisynsets, argv);

  const sync = new GSheets2Git({
    beta: argv.beta,
    multisynsets,
    wordsAddLang,
    words,
    selectedIds,
  });

  console.log('Fetching synsets...');
  await sync.execute();
}
