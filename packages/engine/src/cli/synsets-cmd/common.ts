import compose from '../../compositionRoot';
import type { WordsSheet } from '../../google';

export * from './argv';

export async function getGoogleGitSyncPrerequisites() {
  const { fileDatabase, googleAPIs } = await compose();

  const spreadsheetConfig = await fileDatabase.spreadsheets.findById(
    'new_interslavic_words_list',
  );

  if (!spreadsheetConfig) {
    throw new Error(
      'Cannot find the spreadsheet config for "new_interslavic_words_list"',
    );
  }

  const spreadsheet = googleAPIs.spreadsheet(spreadsheetConfig.google_id);
  const sheet = await spreadsheet.getSheetByTitle('words');
  if (!sheet) {
    throw new Error('Cannot find the sheet: words');
  }

  return {
    wordsSheet: sheet as WordsSheet,
    fileDatabase,
  };
}
