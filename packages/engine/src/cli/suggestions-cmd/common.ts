import compose from '../../compositionRoot';
import type { SuggestionsSheet } from '../../google';

export type PullArgv = {
  subcommand: 'pull';
  _: string[];
};

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
  const suggestions = await spreadsheet.getSheetByTitle('suggestions');
  if (!suggestions) {
    throw new Error('Cannot find the sheet: suggestions');
  }

  return {
    suggestions: suggestions as unknown as SuggestionsSheet,
    multisynsets: fileDatabase.multisynsets,
  };
}
