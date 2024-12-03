import { GSheets2Git } from '../../sync';

import type { PullArgv } from './argv';
import { getGoogleGitSyncPrerequisites, parseSelectedSynsets } from './common';

function toUndefined(value: string): string | undefined {
  return value === '' ? undefined : value;
}

export async function pull(argv: PullArgv) {
  const [spreadsheetName, mainLanguagesSheet, additionalLanguagesSheet] = argv.source
    ? argv.source.split(':').map(toUndefined)
    : [];

  const { multisynsets, words, wordsAddLang } =
    await getGoogleGitSyncPrerequisites({
      spreadsheetName,
      mainLanguagesSheet,
      additionalLanguagesSheet,
    });

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
