import type { CommandBuilder } from 'yargs';
import type { SyncOptions } from '@interslavic/razumlivost-sync';
import { SheetsCache } from '@interslavic/razumlivost-csv';
import { SyncRoutine } from '@interslavic/razumlivost-sync';
import { loadConfig } from '@interslavic/razumlivost-config';
import { GoogleAPIs, GoogleAuthService } from '@interslavic/razumlivost-google';

import { GIDs, LANGS, NATURAL_LANGUAGES } from './constants';

export const command = 'sync [options]';

export const describe = 'Syncs the database';

export const handler = async (argv: SyncOptions) => {
  const configManager = await loadConfig();
  const authService = new GoogleAuthService();
  const authClient = await authService.authorize();
  const google = new GoogleAPIs({ auth: authClient });
  const googleSheets = google.spreadsheet(
    '1N79e_yVHDo-d026HljueuKJlAAdeELAiPzdFzdBuKbY',
  );

  const sheetsCache = new SheetsCache('.cache');

  const sync = new SyncRoutine(
    {
      configManager,
      googleSheets,
      sheetsCache,
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
    group: 'Basic options:',
    alias: 'd',
    choices: ['none', 'all', ...ALL_SHEETS],
    description: 'Sheets to download (comma-separated)',
    default: 'none',
    coerce: coerceSheets,
  },
  flavorize: {
    group: 'Basic options:',
    alias: 'f',
    choices: ['none', 'all', ...Object.keys(NATURAL_LANGUAGES).sort()],
    description: 'Languages to flavorize (comma-separated)',
    default: 'none',
    coerce: coerceLangs,
  },
  analyze: {
    group: 'Basic options:',
    alias: 'a',
    choices: ['none', 'all', ...Object.keys(NATURAL_LANGUAGES).sort()],
    description: 'Languages to analyse (comma-separated)',
    default: 'none',
    coerce: coerceLangs,
  },
  upload: {
    group: 'Basic options:',
    alias: 'u',
    choices: ['none', 'all', ...ALL_SHEETS],
    description: 'Sheets to upload (comma-separated)',
    default: 'none',
    coerce: coerceSheets,
  },
  setPermissions: {
    group: 'Basic options:',
    alias: 'p',
    description:
      'Set permissions on the sheets: invite users, protect ranges, etc.',
    default: false,
    boolean: true,
  },
  force: {
    group: 'Advanced options:',
    description:
      'Specify which operations should overwrite the verified results',
    choices: ['none', 'all', 'flavorize', 'analyze'],
    default: 'none',
    coerce: coerceOperations,
  },
  overwriteCache: {
    group: 'Advanced options:',
    alias: 'o',
    description:
      'Specify which sheets should be overwritten with the intermediate results',
    choices: ['none', 'all', ...ALL_SHEETS],
    default: 'none',
    coerce: coerceSheets,
  },
  configFile: {
    group: 'Advanced options:',
    alias: 'c',
    description: 'Path to the config file',
    default: 'sheets.config.yml',
  },
  decryptionKey: {
    group: 'Advanced options:',
    description: 'Key used to decrypt the config file',
  },
};
