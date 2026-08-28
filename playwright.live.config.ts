import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/live',
  timeout: 30_000,
  retries: 2,
  use: {
    baseURL: process.env.LIVE_SITE_URL || 'https://installer-release-doctor.sociobot.in'
  }
});
