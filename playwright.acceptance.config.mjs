import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/acceptance/specs', testMatch: '**/*.spec.mjs',
  fullyParallel: false, workers: 1, retries: 0, forbidOnly: true,
  timeout: 90000, expect: { timeout: 15000 },
  outputDir: '.acceptance/results',
  reporter: [['list'], ['html', { outputFolder: '.acceptance/report', open: 'never' }]],
  // Traces can record auth tokens/addresses: opt-in only in a controlled local run.
  use: { baseURL: 'http://localhost:3107', actionTimeout: 15000, navigationTimeout: 30000, trace: 'off', screenshot: 'off', video: 'off' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
    ...(process.env.ACCEPTANCE_CROSS_BROWSER === '1' ? [
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
    ] : []),
  ],
  webServer: {
    command: 'node scripts/acceptance/server.mjs', url: 'http://localhost:3107/robots.txt',
    reuseExistingServer: false, timeout: 120000,
  },
});
