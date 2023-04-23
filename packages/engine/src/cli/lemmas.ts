import type { CommandBuilder } from 'yargs';

import compose from '../compositionRoot';

export const command = 'lemmas <subcommand> [options]';

export const describe = 'Executes operations on lemmas';

export const handler = async (argv: LemmasArgv) => {
  if (argv.subcommand !== 'fetch') {
    throw new Error('Unknown subcommand');
  }

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

  console.log('Protected ranges:', wordsSheet.protectedRanges);
};

export const builder: CommandBuilder<LemmasArgv, any> = {
  subcommand: {
    choices: ['fetch'],
    description: 'Subcommand to execute',
    demandOption: true,
  },
};

export type LemmasArgv = {
  subcommand: 'fetch';
};
