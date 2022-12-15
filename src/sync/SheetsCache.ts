import fs from 'fs-extra';
import path from 'path';

import chalk from 'chalk';
import { https } from 'follow-redirects';

import type {
  AnalysisRecord,
  FlavorizationRecord,
  Raw,
  TranslationRecord,
} from '../types/tables';
import { GIDs } from '../utils/constants';
import { parseFile, writeFile } from '../utils/csv';

export default class SheetsCache {
  constructor(private readonly rootDir: string) {}

  async init() {
    await fs.mkdirp(this.rootDir);
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
    const csvPath = path.join(this.rootDir, `analysis-${lang}.csv`);
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
          resolve(undefined);
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
    return path.join(this.rootDir, `${name}.csv`);
  }

  async parseSheet(name: keyof typeof GIDs): Promise<Raw<TranslationRecord>[]> {
    const csvPath = path.join(this.rootDir, `${name}.csv`);
    return parseFile(csvPath);
  }
}
