import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 1 : 0,

  workers: process.env.CI ? 2 : 1,

  timeout: 5 * 60 * 1000,

  expect: {
    timeout: 5 * 1000,
  },

  reporter: process.env.CI
    ? [['blob']]
    : [['html']],

  use: {
    baseURL: 'https://tmdb-discover.surge.sh/',
    headless: true,
    actionTimeout: 5000,

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        viewport: null,
        launchOptions: {
          args: ["--start-maximized"]
        },
      },
    },
  ],
});