import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir: './tests-demo',
  retries: 0,
  projects: [{ name: 'demo', use: { ...devices['Desktop Chrome'] } }],
});
