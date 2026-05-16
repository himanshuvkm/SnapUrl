import { defineConfig } from 'vitest/config'
import path from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => ({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    env: loadEnv(mode, process.cwd(), ''),  // ← loads .env.local
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
}))