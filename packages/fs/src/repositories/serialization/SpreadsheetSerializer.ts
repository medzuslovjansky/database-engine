import { cloneDeep } from 'lodash';

import type { Spreadsheet } from '../../dto';
import { YamlSerializer } from '../../fs';
import type { CryptoService } from '../../types';

export class SpreadsheetSerializer extends YamlSerializer<string, Spreadsheet> {
  constructor(private readonly cryptoService: CryptoService) {
    super();
  }

  async serialize(entityPath: string, entity: Spreadsheet): Promise<void> {
    const copy = cloneDeep(entity);
    for (const p of copy.permissions) {
      p.email = this.cryptoService.encrypt(p.email);
    }

    return super.serialize(entityPath, copy);
  }

  async deserialize(entityPath: string): Promise<Spreadsheet> {
    const raw = await super.deserialize(entityPath);
    for (const p of raw.permissions) {
      p.email = this.cryptoService.decrypt(p.email);
    }

    return raw;
  }
}
