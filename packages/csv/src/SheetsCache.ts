import path from 'node:path';

import fs from 'fs-extra';
import chalk from 'chalk';
import { https } from 'follow-redirects';

import type {
  AnalysisRecord,
  FlavorizationRecord,
  Raw,
  TranslationRecord,
} from './tables';
import { GIDs } from './constants';
import { parseFile, writeFile } from './csv';

export class SheetsCache {
  constructor(private readonly rootDirectory: string) {}

  async init() {
    await fs.mkdirp(this.rootDirectory);
  }

  async getTranslations(): Promise<Raw<TranslationRecord>[]> {
    const records = (await this.parseSheet(
      'translations',
    )) as Raw<TranslationRecord>[];

    for (const t of records) {
      t.frequency = `${t.frequency}`.replace(',', '.');
    }

    return records;
  }

  async getFlavorizations(): Promise<Raw<FlavorizationRecord>[]> {
    return this.parseSheet('flavorizations');
  }

  async getAnalysis(lang: string): Promise<Raw<AnalysisRecord>[]> {
    const csvPath = path.join(this.rootDirectory, `analysis-${lang}.csv`);
    return parseFile(csvPath);
  }

  async downloadSheet(sheetName: keyof typeof GIDs) {
    const outFile = this._resolveSheetPath(sheetName);

    const [baseUrl, gid] = GIDs[sheetName];
    const url = `${baseUrl}?output=csv&format=csv&single=true&gid=${gid}`;
    console.log('Downloading: ' + chalk.green(outFile));

    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outFile);
      const request = https.get(url, function (response) {
        response.pipe(file);

        file.on('error', reject);
        file.on('finish', () => {
          file.close();
          resolve(void 0);
        });
      });

      request.on('error', reject);
    });
  }

  async writeSheet(
    name: keyof typeof GIDs,
    records: Record<string, unknown>[],
  ) {
    const outFile = this._resolveSheetPath(name);
    await writeFile(outFile, records);
  }

  _resolveSheetPath(name: keyof typeof GIDs) {
    return path.join(this.rootDirectory, `${name}.csv`);
  }

  async parseSheet(name: keyof typeof GIDs): Promise<Raw<TranslationRecord>[]> {
    const csvPath = path.join(this.rootDirectory, `${name}.csv`);
    return parseFile(csvPath);
  }
}