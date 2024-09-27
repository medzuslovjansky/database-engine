import type { CommandBuilder } from 'yargs';

import * as subcommand from './suggestions-cmd';

export const command = 'suggestions <subcommand>';

export const describe = 'Imports suggestions from Google Sheets';

export const handler = async (argv: subcommand.PullArgv) => {
  if (argv.subcommand !== 'pull') {
    throw new Error(`Unknown subcommand: ${(argv as any).subcommand}`);
  }

  await subcommand.pull(argv);
};

export const builder: CommandBuilder<subcommand.PullArgv, any> = {
  subcommand: {
    choices: ['pull'],
    description: 'Subcommand to execute',
    demandOption: true,
  },
};
