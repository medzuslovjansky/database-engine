import type { CommandBuilder } from 'yargs';

import compose from '../compositionRoot';
import { GSheets2Git } from '../sync';
import type { WordsSheet } from '../google';

export const command = 'synsets <subcommand> [options]';

export const describe = 'Executes operations on synsets';

export const handler = async (argv: SynsetsArgv) => {
  switch (argv.subcommand) {
    case 'fetch': {
      return fetchSynsets();
    }
    case 'repair': {
      return repairDb();
    }
    default: {
      throw new Error(`Unknown subcommand: ${argv.subcommand}`);
    }
  }
};

async function repairDb() {
  const { fileDatabase } = await compose({ offline: true });
  console.log('Repairing database...');
  // eslint-disable-next-line unicorn/no-array-for-each
  await fileDatabase.multisynsets.forEach(() => {
    /* noop */
  });
}

async function fetchSynsets() {
  const { fileDatabase, googleAPIs } = await compose();
  console.log('Fetching synsets...');

  const synsetSheet = await fileDatabase.spreadsheets.findById(
    'new_interslavic_words_list',
  );

  if (!synsetSheet) {
    throw new Error('Cannot find the spreadsheet: new_interslavic_words_list');
  }

  const newInterslavicWordsList = googleAPIs.spreadsheet(synsetSheet.google_id);
  const wordsSheet = await newInterslavicWordsList.getSheetByTitle('words');
  if (!wordsSheet) {
    throw new Error('Cannot find the sheet: words');
  }

  const sync = new GSheets2Git(
    fileDatabase.multisynsets,
    wordsSheet as WordsSheet,
    false,
  );

  await sync.execute();
}

export const builder: CommandBuilder<SynsetsArgv, any> = {
  subcommand: {
    choices: ['fetch', 'repair'],
    description: 'Subcommand to execute',
    demandOption: true,
  },
};

export type SynsetsArgv = {
  subcommand: 'fetch' | 'repair';
};
