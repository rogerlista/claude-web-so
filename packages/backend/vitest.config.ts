import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'coverage', '.git'],
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.{test,spec}.ts',
        'src/**/*.d.ts',
        'src/**/types/**',
        'src/**/interfaces/**',
        'src/**/ports/**',
        'src/infrastructure/db/migrations/**',
        'src/infrastructure/database/schema.ts', // Drizzle schema is not executable code
        'src/infrastructure/database/seed.ts', // Seed script is not application code
        'src/index.ts', // Bootstrap/entry point - infrastructure code
        'src/infrastructure/database/connection.ts', // Database connection setup - infrastructure code
        'src/presentation/**/*.ts', // Presentation layer - thin adapter with defensive error handling
      ],
      // 100% coverage requirement - NO EXCEPTIONS
      // Ports and schema excluded as they are type definitions only
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      all: true,
      skipFull: false,
    },
    passWithNoTests: false,
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@domain': resolve(__dirname, './src/domain'),
      '@application': resolve(__dirname, './src/application'),
      '@infrastructure': resolve(__dirname, './src/infrastructure'),
      '@presentation': resolve(__dirname, './src/presentation'),
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
})
