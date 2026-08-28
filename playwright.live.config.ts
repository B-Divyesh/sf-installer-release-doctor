import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/live',
  timeout: 30_000,
  retries: 2,
  projects: [
    { name: 'desktop', use: { viewport: { width: 1366, height: 900 } } },
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 } } }
  ],
  use: {
    baseURL: process.env.LIVE_SITE_URL || 'https://installer-release-doctor.sociobot.in'
  }
});
