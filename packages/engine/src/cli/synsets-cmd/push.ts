import { Git2Gsheets } from '../../sync';

import type { PushArgv } from './common';
import { getGoogleGitSyncPrerequisites, parseSelectedSynsets } from './common';

export async function push(argv: PushArgv) {
  const { words, wordsAddLang, multisynsets } =
    await getGoogleGitSyncPrerequisites();

  const selectedIds = await parseSelectedSynsets(multisynsets, argv);
  if (argv.only && !selectedIds) {
    console.log(
      'Skipping push because --only is used and no synsets are selected',
    );
    return;
  }

  const sync = new Git2Gsheets({
    beta: argv.beta,
    words,
    wordsAddLang,
    multisynsets,
    selectedIds,
  });

  console.log('Pushing synsets...');
  await sync.execute();
}
