import fs from 'fs-extra';
import { CommandBuilder } from 'yargs';

import { flavorize } from './steps/flavorize';
import { analyze } from './steps/analyze';
import { GIDs, LANGS, NATURAL_LANGUAGES } from '../utils/constants';
import { downloadSheet } from '../utils/gsheets';
import { parseFile, writeFile } from '../utils/csv';
import { Raw, FlavorizationRecord, TranslationRecord } from '../types/tables';

type SyncOptions = {
  readonly download: Array<keyof typeof GIDs>;
  readonly flavorize: Array<keyof typeof NATURAL_LANGUAGES>;
  readonly analyze: Array<keyof typeof NATURAL_LANGUAGES>;
  readonly upload: Array<keyof typeof GIDs>;
};

export const command = 'sync [options]';

export const describe = 'Syncs the database';

export const handler = async (argv: SyncOptions) => {
  if (argv.download.length > 0) {
    await fs.mkdirp('.cache');

    for (const sheet of argv.download) {
      const isLangCode = sheet.length <= 3;
      const outFile = `.cache/${isLangCode ? `analysis-${sheet}` : sheet}.csv`;
      await downloadSheet(outFile, sheet);
    }
  }

  const translations: Raw<TranslationRecord>[] = await parseFile(
    '.cache/translations.csv',
  );

  for (const t of translations) {
    t.frequency = `${t.frequency}`.replace(',', '.');
  }

  let flavorizations: Raw<FlavorizationRecord>[] = await parseFile(
    '.cache/flavorizations.csv',
  );

  if (argv.flavorize.length > 0) {
    flavorizations = [
      ...flavorize(translations, flavorizations, {
        langs: argv.flavorize,
        forceUpdate: true,
      }),
    ];

    await writeFile('.cache/flavorizations.csv', flavorizations);
  }

  if (argv.analyze.length > 0) {
    for (const lang of argv.analyze) {
      let analysises = await parseFile(`.cache/analysis-${lang}.csv`);
      analysises = [...analyze(translations, flavorizations, analysises, lang)];
      await writeFile('.cache/analysis-${lang}.csv', analysises);
    }
  }

  if (argv.upload.includes('translations')) {
    console.log('TODO: upload translations');
  }

  if (argv.upload.includes('flavorizations')) {
    console.log('TODO: upload flavorizations');
  }
};

const ALL_SHEETS = Object.keys(GIDs) as Array<keyof typeof GIDs>;

export const builder: CommandBuilder<SyncOptions, any> = {
  download: {
    alias: 'd',
    choices: ['none', 'all', ...ALL_SHEETS],
    description: 'Sheets to download (comma-separated)',
    default: 'none',
    coerce: (value: string) =>
      value === 'none' ? [] : value === 'all' ? ALL_SHEETS : value.split(','),
  },
  flavorize: {
    alias: 'f',
    choices: ['none', 'all', ...Object.keys(NATURAL_LANGUAGES).sort()],
    description: 'Languages to flavorize (comma-separated)',
    default: 'none',
    coerce: (value: string) =>
      value === 'none' ? [] : value === 'all' ? LANGS : value.split(','),
  },
  analyze: {
    alias: 'a',
    choices: ['none', 'all', ...Object.keys(NATURAL_LANGUAGES).sort()],
    description: 'Languages to analyse (comma-separated)',
    default: 'none',
    coerce: (value: string) =>
      value === 'none' ? [] : value === 'all' ? LANGS : value.split(','),
  },
  upload: {
    alias: 'u',
    choices: ['none', 'all', ...ALL_SHEETS],
    description: 'Sheets to upload (comma-separated)',
    default: 'none',
    coerce: (value: string) =>
      value === 'none' ? [] : value === 'all' ? ALL_SHEETS : value.split(','),
  },
};
