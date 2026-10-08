import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: 0,
  workers: 1,
  reporter: [['line'], ['junit', { outputFile: 'test-results/e2e-junit.xml' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8088',
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
