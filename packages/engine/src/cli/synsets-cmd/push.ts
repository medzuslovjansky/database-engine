import { Git2Gsheets } from '../../sync/words/Git2Gsheets';
import type { WordsSheet } from '../../google';

import type { PushArgv } from './common';
import { getGoogleGitSyncPrerequisites } from './common';

export async function push(argv: PushArgv) {
  const { fileDatabase, wordsSheet } = await getGoogleGitSyncPrerequisites();

  let synsetIds = await Promise.all(
    argv._.map(async (filePath) => {
      const id = await fileDatabase.multisynsets.deduceId(filePath);
      if (id === undefined) {
        console.warn(`Invalid filepath: ${filePath}`);
      }
      return id ?? Number.NaN;
    }),
  );

  synsetIds = synsetIds.filter((element) => Number.isFinite(element));

  const sync = new Git2Gsheets({
    beta: argv.beta,
    fs: fileDatabase.multisynsets,
    gsheets: wordsSheet as WordsSheet,
    selectedIds: synsetIds.length > 0 ? synsetIds : undefined,
  });

  console.log('Pushing synsets...');
  await sync.execute();
}
