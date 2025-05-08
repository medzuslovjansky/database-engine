import fs from 'node:fs/promises';

import * as esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

const ESM_REQUIRE_SHIM = `
await (async () => {
  const { dirname } = await import("path");
  const { fileURLToPath } = await import("url");

  /**
   * Shim entry-point related paths.
   */
  if (typeof globalThis.__filename === "undefined") {
    globalThis.__filename = fileURLToPath(import.meta.url);
  }
  if (typeof globalThis.__dirname === "undefined") {
    globalThis.__dirname = dirname(globalThis.__filename);
  }
  /**
   * Shim require if needed.
   */
  if (typeof globalThis.require === "undefined") {
    const { default: module } = await import("module");
    globalThis.require = module.createRequire(import.meta.url);
  }
})();
`;

async function build() {
  try {
    await fs.mkdir('dist', { recursive: true });

    const { metafile } = await esbuild.build({
      entryPoints: ['scripts/cli.js'],
      bundle: true,
      outfile: 'dist/cli.js',
      platform: 'node',
      target: 'node20',
      format: 'esm',
      banner: {
        js: '#!/usr/bin/env node\n\n' + ESM_REQUIRE_SHIM,
      },
      external: ['prettier'],
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
