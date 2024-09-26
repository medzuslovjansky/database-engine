import type { CommandBuilder } from 'yargs';
import type { DrivePermission, Range } from '@interslavic/database-engine-fs';

import compose from '../compositionRoot';

export const command = 'spreadsheets <subcommand> [options]';

export const describe = 'Executes operations on Google Spreadsheets';

export const handler = async (argv: SheetsArgv) => {
  switch (argv.subcommand) {
    case 'fetch': {
      return fetchSheet(argv);
    }
    case 'probe': {
      return probeSheet(argv);
    }
    default: {
      throw new Error(`Unknown subcommand: ${(argv as any).subcommand}`);
    }
  }
};

async function fetchSheet(argv: SpreadsheetsFetchArgv) {
  const { fileDatabase, googleAPIs } = await compose();

  const config = await fileDatabase.spreadsheets.findById(argv.id);
  if (!config) {
    throw new Error(`Cannot find the spreadsheet: ${argv.id}`);
  }

  const driveDocument = googleAPIs.driveDocument(config.google_id);
  const permissions = await driveDocument.getPermissions();
  const newPermissions = permissions
    .filter((p) => p.type === 'user')
    .map(
      (p) =>
        ({
          name: p.displayName!,
          email: p.emailAddress!,
          role: p.role!,
        } as DrivePermission),
    );

  await fileDatabase.spreadsheets.update(argv.id, {
    permissions: newPermissions,
  });

  const sheetDocument = googleAPIs.spreadsheet(config.google_id);
  const sheets = await sheetDocument.getSheets();
  const newSheets = sheets.map((s) => ({
    name: s.title!,
    ranges: s.protectedRanges.map(
      (r) =>
        ({
          name: r.description,
          range: r.range,
          warn: r.warningOnly,
          editors: r.editors?.users,
        } as Range),
    ),
  }));

  await fileDatabase.spreadsheets.update(argv.id, {
    sheets: newSheets,
  });
}

async function probeSheet(argv: SpreadsheetsProbeArgv) {
  const { fileDatabase, googleAPIs } = await compose();

  const config = await fileDatabase.spreadsheets.findById(argv.id);
  if (!config) {
    throw new Error(`Cannot find the spreadsheet: ${argv.id}`);
  }

  const spreadsheet = googleAPIs.spreadsheet(config.google_id);
  const sheet = await spreadsheet.getSheetByTitle(argv.sheet);
  if (!sheet) {
    throw new Error(`Cannot find the sheet: ${argv.sheet}`);
  }

  sheet.batch.updateRows({
    sheetId: sheet.id,
    startRowIndex: argv.row - 1,
    startColumnIndex: convertLetterToIndex(argv.column),
    values: [[argv.value]],
    notes: argv.note ? [[argv.note]] : undefined,
  });

  await sheet.flush();
}

function convertLetterToIndex(letter: string) {
  // eslint-disable-next-line unicorn/prefer-code-point
  return letter.charCodeAt(0) - 'A'.charCodeAt(0);
}

export const builder: CommandBuilder<SheetsArgv, any> = {
  subcommand: {
    choices: ['fetch', 'probe'],
    description: 'Subcommand to execute',
    demandOption: true,
  },
  id: {
    description: 'ID of the spreadsheet to fetch',
    demandOption: true,
  },
  sheet: {
    description: '[probe] Title of the sheet to probe',
  },
  row: {
    description: '[probe] Row index to probe',
    type: 'number',
  },
  column: {
    description: '[probe] Column to probe (A..Z)',
  },
  value: {
    description: '[probe] Value to update in the cell',
  },
  note: {
    description: '[probe] Note to update in the cell',
  },
};

export type SheetsArgv = SpreadsheetsFetchArgv | SpreadsheetsProbeArgv;

export type SpreadsheetsFetchArgv = {
  subcommand: 'fetch';
  id: string;
};

export type SpreadsheetsProbeArgv = {
  subcommand: 'probe';
  id: string;
  sheet: string;
  row: number;
  column: string;
  value: string;
  note: string;
};
