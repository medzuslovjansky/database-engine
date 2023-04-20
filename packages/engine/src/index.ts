#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .scriptName('isv')
  .commandDir(__dirname, {
    extensions: process.env.NODE_ENV === 'development' ? ['js', 'ts'] : ['js'],
  })
  .demandCommand()
  .recommendCommands()
  .help().argv;
