import 'zx/globals';

export async function downloadSheet(outFile, baseUrl, gid) {
  const url = `${baseUrl}?output=csv&single=true&gid=${gid}`;
  await $`curl -L -o ${outFile} ${url}`;
}

export async function redownloadSheet(outFile, baseUrl, gid) {
  await fs.remove(outFile);
  await downloadSheet(outFile, baseUrl, gid);
}
