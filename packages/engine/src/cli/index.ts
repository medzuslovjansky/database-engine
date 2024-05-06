/* eslint-disable @typescript-eslint/no-explicit-any */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import * as diff from './diff';
import * as synsets from './synsets';
import * as spreadsheets from './spreadsheets';
import * as users from './users';

yargs(hideBin(process.argv))
  .scriptName('isv')
  .command(diff as any)
  .command(synsets as any)
  .command(spreadsheets as any)
  .command(users as any)
  .demandCommand()
  .recommendCommands()
  .help().argv;
