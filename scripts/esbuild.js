import fs from 'node:fs/promises';

import * as esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

async function build() {
  try {
    const { metafile } = await esbuild.build({
      entryPoints: ['scripts/cli.js'],
      bundle: true,
      outfile: 'dist/cli.js',
      platform: 'node',
      target: 'node20',
      format: 'esm',
      banner: {
        js: '#!/usr/bin/env node',
      },
      minify: false,
      sourcemap: true,
      metafile: true,
      resolveExtensions: ['.ts', '.js'],
      tsconfig: 'presets/typescript-config/tsconfig.json',
      plugins: [nodeExternalsPlugin({ devDependencies: false })],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    });

    await fs.writeFile('dist/metafile.json', JSON.stringify(metafile, null, 2));
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
