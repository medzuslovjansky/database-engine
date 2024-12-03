import { Git2Gsheets } from '../../sync';

import type { PushArgv } from './argv';
import { getGoogleGitSyncPrerequisites, parseSelectedSynsets } from './common';

export async function push(argv: PushArgv) {
  const { words, wordsAddLang, multisynsets } =
    await getGoogleGitSyncPrerequisites();

  if (!wordsAddLang) {
    throw new Error('Cannot find the sheet: words_add_lang');
  }

  const selectedIds = await parseSelectedSynsets(multisynsets, argv);
  if (argv.only && !selectedIds) {
    console.log(
      'Skipping push because --only is used and no synsets are selected',
    );
    return;
  }

  const sync = new Git2Gsheets({
    words,
    wordsAddLang,
    multisynsets,
    selectedIds,
    partialSync: argv.partial,
    changeNote: argv.note,
  });

  console.log('Pushing synsets...');
  await sync.execute();
}
