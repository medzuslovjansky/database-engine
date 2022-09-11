import fs from 'fs';

import * as csv from 'csv';

export async function parseFile(filePath, options = {}) {
  const { delimiter = ',', silent = false } = options;
  if (silent && !fs.existsSync(filePath)) {
    return [];
  }

  const data = await new Promise((resolve, reject) => {
    const records = [];
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

export function writeFile(filePath, records) {
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

function _readRecords(records) {
  let record;
  while ((record = this.read()) !== null) {
    records.push(record);
  }
}
