import compose from '../../compositionRoot';
import type { WordsAddLangSheet, WordsSheet } from '../../google';

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
  const words = await spreadsheet.getSheetByTitle('words');
  if (!words) {
    throw new Error('Cannot find the sheet: words');
  }

  const wordsAddLang = await spreadsheet.getSheetByTitle('words_add_lang');
  if (!wordsAddLang) {
    throw new Error('Cannot find the sheet: words_add_lang');
  }

  return {
    words: words as WordsSheet,
    wordsAddLang: wordsAddLang as WordsAddLangSheet,
    multisynsets: fileDatabase.multisynsets,
  };
}
