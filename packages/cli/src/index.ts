#!/usr/bin/env node

import * as process from 'node:process';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import transliterate from './transliterate.js';
import type { TransliterateArgv } from './transliterate.js';

const cli = yargs(hideBin(process.argv))
  .scriptName('isv')
  .usage('Usage: $0 <command> [options]')
  .usage('\nCommands:\n')
  .usage('  transliterate  Transliterate plain or Markdown text')
  .command<TransliterateArgv>(transliterate)
  .demandCommand(1, 'Please specify a command')
  .strict()
  .help()
  .fail((message, error, yargs) => {
    if (error) {
      console.error(error.message + '\n');
    } else {
      console.error(message + '\n');
    }
    yargs.showHelp();
    process.exit(1);
  });

if (process.argv.length === 2) {
  cli.showHelp();
} else {
  cli.parse();
}
