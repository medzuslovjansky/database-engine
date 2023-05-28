import { Git2Gsheets } from '../../sync';

import type { PushArgv } from './common';
import { getGoogleGitSyncPrerequisites } from './common';

export async function push(argv: PushArgv) {
  const { words, wordsAddLang, multisynsets } =
    await getGoogleGitSyncPrerequisites();

  // TODO: find out why need slice(1)
  let synsetIds = await Promise.all(
    argv._.slice(1).map(async (filePath) => {
      const id = await multisynsets.deduceId(filePath);
      if (id === undefined) {
        console.warn(`Invalid filepath: ${filePath}`);
      }
      return id ?? Number.NaN;
    }),
  );

  synsetIds = synsetIds.filter((element) => Number.isFinite(element));
  if (synsetIds.length === 0 && argv._.length > 1) {
    throw new Error('No valid synset ids found.');
  }

  const sync = new Git2Gsheets({
    beta: argv.beta,
    words,
    wordsAddLang,
    multisynsets,
    selectedIds: synsetIds.length > 0 ? synsetIds : undefined,
  });

  console.log('Pushing synsets...');
  await sync.execute();
}
