import * as fs from 'node:fs';

import isv from '@interslavic/utils';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import type { Literal } from 'unist';
import { visit } from 'unist-util-visit';
import type { CommandModule } from 'yargs';

export interface TransliterateArgv {
  input?: string;
  output?: string;
  format?: 'plain' | 'markdown';
  script: isv.FlavorisationBCP47Code;
}

const commandModule: CommandModule<unknown, TransliterateArgv> = {
  command: 'transliterate',
  aliases: ['t'],
  builder: {
    script: {
      alias: 's',
      describe: 'Target script',
      demandOption: true,
      choices: Object.values(isv.FlavorisationBCP47),
    },
    format: {
      alias: 'f',
      describe: 'Input format',
      choices: ['plain', 'markdown'],
      default: 'plain',
    },
    input: {
      alias: 'i',
      describe: 'Input file [default: stdin]',
      type: 'string',
    },
    output: {
      alias: 'o',
      describe: 'Output file [default: stdout]',
      type: 'string',
    },
  },
  async handler(argv) {
    const { format, script, input, output } = argv;

    const processor = unified()
      .use(remarkParse)
      .use(() => (tree) => {
        visit(tree, 'text', (node: Literal) => {
          node.value = isv.transliterate(String(node.value), script);
        });
      })
      .use(remarkStringify);

    let inputData = '';

    if (input) {
      inputData = await fs.promises.readFile(input, 'utf8');
    } else {
      const stdin = process.stdin;
      stdin.setEncoding('utf8');
      stdin.on('data', (chunk) => {
        inputData += chunk;
      });
      await new Promise((resolve) => {
        stdin.on('end', resolve);
      });
    }

    const file =
      format === 'plain'
        ? isv.transliterate(inputData, script)
        : await processor.process(inputData);

    if (output) {
      await fs.promises.writeFile(output, String(file));
    } else {
      process.stdout.write(String(file));
    }
  },
};

export default commandModule;
