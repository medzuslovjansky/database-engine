import 'zx/globals';
import fd from 'follow-redirects';
import fs from 'fs';

const https = fd.https;

export async function downloadSheet(outFile, baseUrl, gid) {
  const url = `${baseUrl}?output=csv&format=csv&single=true&gid=${gid}`;
  console.log('Downloading: ' + chalk.green(outFile));

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outFile);
    const request = https.get(url, function(response) {
      response.pipe(file);

      file.on("error", reject);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    request.on('error', reject);
  });
}

export async function redownloadSheet(outFile, baseUrl, gid) {
  await fs.remove(outFile);
  await downloadSheet(outFile, baseUrl, gid);
}
