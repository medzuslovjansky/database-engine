import compose from '../../compositionRoot';

import type { RebuildArgv } from './argv';

export async function rebuild(_argv: RebuildArgv) {
  const { fileDatabase } = await compose({ offline: true });
  console.log('Repairing database...');
  // eslint-disable-next-line unicorn/no-array-for-each
  await fileDatabase.multisynsets.forEach(() => {
    /* noop */
  });
}
