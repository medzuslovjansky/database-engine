import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { snakeCase } from 'lodash';

import { YamlSerializer } from '../../fs';
import type { Lemma } from '../../dto';

export class LemmaSerializer extends YamlSerializer<number, Lemma> {
  async serialize(entityPath: string, entity: Lemma): Promise<void> {
    await super.serialize(
      join(entityPath, `${snakeCase(entity.isv[0])}.yml`),
      entity,
    );
  }

  async deserialize(entityPath: string): Promise<Lemma> {
    const files = await readdir(entityPath);
    const file = files.find(isValidLemmaFilename);
    if (!file) {
      throw new Error(`No valid lemma file found in ${entityPath}`);
    }

    return super.deserialize(join(entityPath, file));
  }
}

function isValidLemmaFilename(filename: string): boolean {
  return !filename.startsWith('_') && filename.endsWith('.yml');
}
