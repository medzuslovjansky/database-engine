import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import type { CommandBuilder } from 'yargs';
import type { MultilingualSynset } from '@interslavic/database-engine-core';

import compose from '../compositionRoot';
import { DiffGenerator } from '../diff';

export const command = 'diff [options]';

export const describe = 'Creates a changelog for database changes';

export const handler = async (argv: DiffArgv) => {
  const rootDirectory = await fs.mkdtemp(`${os.tmpdir()}/isv-diff`);
  const { fileDatabase } = await compose({
    offline: true,
    rootDirectory,
  });

  const diffGenerator = new DiffGenerator<MultilingualSynset, any>(
    argv.before,
    argv.after,
    async (fileName, content) => {
      if (!fileName.includes('synsets/') || !fileName.endsWith('.xml')) {
        return null;
      }

      const tempSynsetPath = path.join(rootDirectory, fileName);
      await fs.mkdir(path.dirname(tempSynsetPath), { recursive: true });
      await fs.writeFile(tempSynsetPath, content, 'utf8');
      const id = await fileDatabase.multisynsets.deduceId(tempSynsetPath);
      try {
        const synset = await fileDatabase.multisynsets.findById(id!);
        return synset || null;
      } catch {
        return null;
      }
    },
    (before, after) => {
      if (before && after) {
        const result: any = {
          type: 'update',
          id: String(after.id),
          en: String(after.synsets.en),
          isv: String(after.synsets.isv),
          addition: after.synsets.isv?.lemmas?.[0].steen?.addition,
        };
        const count = Object.keys(after.synsets).length;
        if (before.id !== after.id) {
          result.id_before = before.id;
        }
        if (String(before.synsets.en) !== String(after.synsets.en)) {
          result.en_before = String(before.synsets.en);
        }
        if (String(before.synsets.isv) !== String(after.synsets.isv)) {
          result.isv_before = String(before.synsets.isv);
        }
        const steenBefore = before.synsets.isv?.lemmas?.[0].steen?.addition;
        if (result.addition !== steenBefore) {
          result.addition_before = steenBefore;
        }
        return Object.keys(result).length > count ? result : null;
      } else if (before) {
        return {
          type: 'delete',
          id: before.id,
          lemma: before.synsets.isv!.toString(),
        };
      } else if (after) {
        return {
          type: 'add',
          id: after.id,
          lemma: after.synsets.isv!.toString(),
        };
      } else {
        return null;
      }
    },
    (diffs) => {
      const additions = diffs.filter((diff) => diff.type === 'add');
      const deletions = diffs.filter((diff) => diff.type === 'delete');
      const updates = diffs.filter((diff) => diff.type === 'update');

      const deletion_list = deletions
        .map((diff) => `<del>${diff.id}. ${diff.lemma}</del><br>`)
        .join('\n');
      const addition_list = additions
        .map((diff) => `<ins>${diff.id}. ${diff.lemma}</ins><br>`)
        .join('\n');
      const update_list = updates.map((diff) => {
        const id = diff.id_before
          ? `<del>${diff.id_before}</del> → <ins>${diff.id}</ins>`
          : diff.id;
        const isv = diff.isv_before
          ? `<del>${diff.isv_before}</del> → <ins>${diff.isv}</ins>`
          : diff.isv;
        const addition = diff.addition_before
          ? `<del>${diff.addition_before}</del> → <ins>${diff.addition}</ins>`
          : diff.addition;
        return `${id}. ${isv} ${addition}<br>`;
      });

      return `<h2>Additions</h2>\n${addition_list}\n<h2>Deletions</h2>\n${deletion_list}\n<h2>Updates</h2>\n${update_list}`;
    },
  );

  let report = await diffGenerator.execute();
  if (!report.endsWith('\n')) {
    report += '\n';
  }

  if (argv.out) {
    await fs.writeFile(argv.out, report);
  } else {
    process.stdout.write(report);
  }

  await fs.rm(rootDirectory, { recursive: true });
};

export const builder: CommandBuilder<DiffArgv, any> = {
  before: {
    description: 'Baseline Git tag',
    default: 'HEAD^',
  },
  after: {
    description: 'Target Git tag',
    default: 'HEAD',
  },
  out: {
    description: 'Output file for report',
    type: 'string',
    demandOption: false,
  },
};

export type DiffArgv = {
  before: string;
  after: string;
  out: string;
};
