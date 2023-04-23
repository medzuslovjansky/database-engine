import type { CommandBuilder } from 'yargs';

export const command = 'lemmas <subcommand> [options]';

export const describe = 'Executes operations on lemmas';

export const handler = async (argv: LemmasArgv) => {
  if (argv.subcommand !== 'fetch') {
    throw new Error('Unknown subcommand');
  }

  console.log('Fetching lemmas...');
};

export const builder: CommandBuilder<LemmasArgv, any> = {
  subcommand: {
    choices: ['fetch'],
    description: 'Subcommand to execute',
    demandOption: true,
  },
};

export type LemmasArgv = {
  subcommand: 'fetch';
};
