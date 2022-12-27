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

const coerceSheets = (value: string) =>
  value === 'none' ? [] : value === 'all' ? ALL_SHEETS : value.split(',');

const coerceLangs = (value: string) =>
  value === 'none' ? [] : value === 'all' ? LANGS : value.split(',');

const coerceOperations = (value: string) =>
  value === 'none'
    ? []
    : value === 'all'
    ? ['flavorize', 'analyze']
    : value.split(',');

export const builder: CommandBuilder<SyncOptions, any> = {
  download: {
    alias: 'd',
    choices: ['none', 'all', ...ALL_SHEETS],
    description: 'Sheets to download (comma-separated)',
    default: 'none',
    coerce: coerceSheets,
  },
  flavorize: {
    alias: 'f',
    choices: ['none', 'all', ...Object.keys(NATURAL_LANGUAGES).sort()],
    description: 'Languages to flavorize (comma-separated)',
    default: 'none',
    coerce: coerceLangs,
  },
  analyze: {
    alias: 'a',
    choices: ['none', 'all', ...Object.keys(NATURAL_LANGUAGES).sort()],
    description: 'Languages to analyse (comma-separated)',
    default: 'none',
    coerce: coerceLangs,
  },
  upload: {
    alias: 'u',
    choices: ['none', 'all', ...ALL_SHEETS],
    description: 'Sheets to upload (comma-separated)',
    default: 'none',
    coerce: coerceSheets,
  },
  setPermissions: {
    alias: 'p',
    description:
      'Set permissions on the sheets: invite users, protect ranges, etc.',
    default: false,
    boolean: true,
  },
  force: {
    description:
      'Specify which operations should overwrite the verified results',
    choices: ['none', 'all', 'flavorize', 'analyze'],
    default: 'none',
    coerce: coerceOperations,
  },
  overwriteCache: {
    alias: 'o',
    description:
      'Specify which sheets should be overwritten with the intermediate results',
    choices: ['none', 'all', ...ALL_SHEETS],
    default: 'none',
    coerce: coerceSheets,
  },
};
