import type { CommandBuilder } from 'yargs';

import * as subcommand from './synsets-cmd';

export const command = 'synsets <subcommand>';

export const describe = 'Executes operations on synsets';

export const handler = async (argv: subcommand.SynsetsArgv) => {
  switch (argv.subcommand) {
    case 'pull': {
      return subcommand.pull(argv);
    }
    case 'push': {
      return subcommand.push(argv);
    }
    case 'rebuild': {
      return subcommand.rebuild(argv);
    }
    default: {
      throw new Error(`Unknown subcommand: ${(argv as any).subcommand}`);
    }
  }
};

export const builder: CommandBuilder<subcommand.SynsetsArgvAny, any> = {
  subcommand: {
    choices: ['pull', 'push', 'repair'],
    description: 'Subcommand to execute',
    demandOption: true,
  },
  beta: {
    type: 'boolean',
    description: 'Use beta features',
    default: process.env.ISV_BETA === 'true',
  },
};
