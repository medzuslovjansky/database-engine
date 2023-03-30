import fs from 'fs';

import * as csv from 'csv';
import type { Parser } from 'csv-parse';

type ParseFileOptions = {
  delimiter?: string;
  silent?: boolean;
};

export type Table = Record<string, unknown>[];

export async function parseFile(
  filePath: string,
  options: ParseFileOptions = {},
): Promise<any[]> {
  const { delimiter = ',', silent = false } = options;
  if (silent && !fs.existsSync(filePath)) {
    return [];
  }

  const data = await new Promise<Table>((resolve, reject) => {
    const records: Record<string, unknown>[] = [];
    const parser = csv.parse({
      columns: true,
      delimiter,
    });

    fs.createReadStream(filePath)
      .on('error', reject)
      .pipe(
        parser
          .on('error', reject)
          .on('readable', _readRecords.bind(parser, records))
          .on('end', () => resolve(records)),
      );
  });

  return data;
}

export function writeFile(
  filePath: string,
  records: Record<string, unknown>[],
) {
  return new Promise((resolve, reject) => {
    const filestream = fs.createWriteStream(filePath);
    filestream.on('error', reject);
    filestream.on('close', resolve);
    csv
      .stringify(records, {
        header: true,
      })
      .pipe(filestream);
  });
}

function _readRecords(this: Parser, records: Record<string, unknown>[]) {
  let record;
  while ((record = this.read()) !== null) {
    records.push(record);
  }
}
