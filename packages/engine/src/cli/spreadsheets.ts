import type { CommandBuilder } from 'yargs';
import type { DrivePermission, Range } from '@interslavic/database-engine-fs';

import compose from '../compositionRoot';

export const command = 'spreadsheets <subcommand> [options]';

export const describe = 'Executes operations on Google Spreadsheets';

export const handler = async (argv: SheetsArgv) => {
  switch (argv.subcommand) {
    case 'fetch': {
      return fetchSheet();
    }
  }

  async function fetchSheet() {
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
};

export const builder: CommandBuilder<SheetsArgv, any> = {
  subcommand: {
    choices: ['fetch'],
    description: 'Subcommand to execute',
    demandOption: true,
  },
  id: {
    description: 'ID of the spreadsheet to fetch',
    demandOption: true,
  },
};

export type SheetsArgv = {
  subcommand: 'fetch';
  id: string;
};
