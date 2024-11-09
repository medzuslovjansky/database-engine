import { GSheets2Git } from '../../sync';

import type { PullArgv } from './argv';
import { getGoogleGitSyncPrerequisites, parseSelectedSynsets } from './common';

export async function pull(argv: PullArgv) {
  const { multisynsets, words, wordsAddLang } =
    await getGoogleGitSyncPrerequisites();

  const selectedIds = await parseSelectedSynsets(multisynsets, argv);
  if (argv.only && !selectedIds) {
    console.log(
      'Skipping pull because --only is used and no synsets are selected',
    );
    return;
  }

  const sync = new GSheets2Git({
    multisynsets,
    wordsAddLang,
    words,
    selectedIds,
    partialSync: argv.partial,
  });

  console.log('Fetching synsets...');
  await sync.execute();
}
