/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

const BASE_URL =
  process.env['PLAYWRIGHT_BASE_URL'] ??
  'https://tech-andgar.github.io/image-to-pdf-client-public/';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    locale: 'en-US',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
