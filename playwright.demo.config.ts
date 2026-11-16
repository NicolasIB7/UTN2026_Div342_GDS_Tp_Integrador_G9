import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// Pruebas unitarias del módulo de self-healing: sin la app y sin red (el LLM se simula).
export default defineConfig({
  ...base,
  testDir: './tests-demo',
  retries: 0,
  webServer: undefined,
  projects: [{ name: 'demo', use: { ...devices['Desktop Chrome'] } }],
});
