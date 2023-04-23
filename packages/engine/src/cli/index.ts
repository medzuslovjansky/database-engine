import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .scriptName('isv')
  .commandDir(__dirname, {
    extensions: process.argv[0]?.includes('ts-node') ? ['js', 'ts'] : ['js'],
  })
  .demandCommand()
  .recommendCommands()
  .help().argv;
