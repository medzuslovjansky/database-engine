import chalk from 'chalk';
import fd from 'follow-redirects';
import fs from 'fs';
import { GIDs } from './constants';

const https = fd.https;

export async function downloadSheet(
  outFile: string,
  sheetName: keyof typeof GIDs,
) {
  const [baseUrl, gid] = GIDs[sheetName];
  const url = `${baseUrl}?output=csv&format=csv&single=true&gid=${gid}`;
  console.log('Downloading: ' + chalk.green(outFile));

  return new Promise((resolve, reject) => {
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
