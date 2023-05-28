import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';

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

export async function parseSelectedSynsets(
  multisynsets: MultilingualSynsetRepository,
  argv: { _: string[] },
): Promise<undefined | number[]> {
  // TODO: find out why need slice(1)
  const synsetIds = await Promise.all(
    argv._.slice(1).map(async (filePath) => {
      const id = await multisynsets.deduceId(filePath);
      if (id === undefined) {
        console.warn(`Invalid filepath: ${filePath}`);
      }
      return id ?? Number.NaN;
    }),
  );

  const validSynsetIds = synsetIds.filter((element) =>
    Number.isFinite(element),
  );
  if (validSynsetIds.length < synsetIds.length) {
    throw new Error('Some of used paths are invalid');
  }

  if (validSynsetIds.length > 0) {
    return validSynsetIds;
  }

  return;
}
