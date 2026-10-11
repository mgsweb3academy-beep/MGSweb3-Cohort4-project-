import { defineConfig } from 'vitest/config';
import path from 'node:path';
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname), types: path.resolve(__dirname, '../../packages/types/index.ts') } },
  test: { include: ['tests/**/*.test.ts', 'lib/**/*.test.ts'], environment: 'node' },
});
