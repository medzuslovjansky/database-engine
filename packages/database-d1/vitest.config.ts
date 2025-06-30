import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@database-d1$/, replacement: path.resolve(__dirname, 'src') },
      { find: /^@database-d1\/(.*)$/, replacement: path.resolve(__dirname, 'src/$1') },
    ],
  },
  test: {
    setupFiles: ['./vitest.setup.ts'],
    environment: 'node',
    globals: true,
  },
});
