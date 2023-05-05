import type { CommandBuilder } from 'yargs';

import compose from '../compositionRoot';
import { GSheets2Git } from '../sync';
import type { WordsSheet } from '../google';

export const command = 'lemmas <subcommand> [options]';

export const describe = 'Executes operations on lemmas';

export const handler = async (argv: LemmasArgv) => {
  switch (argv.subcommand) {
    case 'fetch': {
      return fetchLemmas();
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
  const { fileDatabase } = await compose();
  console.log('Repairing database...');
  // eslint-disable-next-line unicorn/no-array-for-each
  await fileDatabase.multisynsets.forEach(() => {
    /* noop */
  });
}

async function fetchLemmas() {
  const { fileDatabase, googleAPIs } = await compose();
  console.log('Fetching lemmas...');

  const lemmaSheet = await fileDatabase.spreadsheets.findById(
    'new_interslavic_words_list',
  );

  if (!lemmaSheet) {
    throw new Error('Cannot find the spreadsheet: new_interslavic_words_list');
  }

  const newInterslavicWordsList = googleAPIs.spreadsheet(lemmaSheet.google_id);
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

export const builder: CommandBuilder<LemmasArgv, any> = {
  subcommand: {
    choices: ['fetch', 'repair'],
    description: 'Subcommand to execute',
    demandOption: true,
  },
};

export type LemmasArgv = {
  subcommand: 'fetch' | 'repair';
};
