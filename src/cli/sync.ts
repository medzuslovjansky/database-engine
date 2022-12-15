import { CommandBuilder } from 'yargs';
import { GIDs, LANGS, NATURAL_LANGUAGES } from '../utils/constants';
import {
  GoogleSheetsAPI,
  SheetsCache,
  SyncOptions,
  SyncRoutine,
} from '../sync';
import { GoogleAuthService } from '../utils/gsheets';

export const command = 'sync [options]';

export const describe = 'Syncs the database';

export const handler = async (argv: SyncOptions) => {
  const authService = new GoogleAuthService();
  const authClient = await authService.authorize();

  const sync = new SyncRoutine(
    {
      googleSheets: new GoogleSheetsAPI(authClient),
      sheetsCache: new SheetsCache('.cache'),
    },
    argv,
  );

  await sync.run();
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
  setPermissions: {
    alias: 'p',
    description:
      'Set permissions on the sheets: invite users, protect ranges, etc.',
    default: false,
    boolean: true,
  },
};
