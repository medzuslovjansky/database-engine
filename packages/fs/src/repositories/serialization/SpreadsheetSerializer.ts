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

    for (const p of copy.permissions ?? []) {
      p.email = this.cryptoService.encrypt(p.email);
    }

    for (const sheet of copy.sheets ?? []) {
      for (const range of sheet.ranges ?? []) {
        range.editors = range.editors?.map((email) =>
          this.cryptoService.encrypt(email),
        );
      }
    }

    return super.serialize(entityPath, copy);
  }

  async deserialize(entityPath: string): Promise<Spreadsheet> {
    const raw = await super.deserialize(entityPath);
    raw.permissions ??= [];
    for (const p of raw.permissions) {
      p.email = this.cryptoService.decrypt(p.email);
    }

    raw.sheets ??= [];
    for (const sheet of raw.sheets) {
      sheet.ranges ??= [];
      for (const range of sheet.ranges) {
        range.editors = range.editors?.map((email) =>
          this.cryptoService.decrypt(email),
        );
      }
    }

    return raw;
  }
}
