import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';

import compose from '../../compositionRoot';
import type { WordsAddLangSheet, WordsSheet } from '../../google';

export * from './argv';

interface Overrides {
  spreadsheetName?: string;
  mainLanguagesSheet?: string;
  additionalLanguagesSheet?: string;
}

export async function getGoogleGitSyncPrerequisites({
  spreadsheetName = 'new_interslavic_words_list',
  mainLanguagesSheet = 'words',
  additionalLanguagesSheet = 'words_add_lang'
}: Overrides = {}) {
  const { fileDatabase, googleAPIs } = await compose();

  const spreadsheetConfig = await fileDatabase.spreadsheets.findById(
    spreadsheetName,
  );

  if (!spreadsheetConfig) {
    throw new Error(
      `Cannot find the spreadsheet config with the name: ${spreadsheetName}`,
    );
  }

  const spreadsheet = googleAPIs.spreadsheet(spreadsheetConfig.google_id);
  const words = await spreadsheet.getSheetByTitle(mainLanguagesSheet);
  if (!words) {
    throw new Error(`Cannot find the sheet: ${mainLanguagesSheet}`);
  }

  const wordsAddLang = await spreadsheet.getSheetByTitle(additionalLanguagesSheet);

  return {
    words: words as unknown as WordsSheet,
    wordsAddLang: wordsAddLang as unknown as (WordsAddLangSheet | undefined),
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
