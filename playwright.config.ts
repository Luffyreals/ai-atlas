import { defineConfig, devices } from '@playwright/test';

// 4322, not Astro's default 4321: `npm run dev` often runs there, and with reuseExistingServer the e2e
// tests would quietly run against the dev server. "localhost", since preview may listen on [::1] only.
const PORT = 4322;

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}/vi/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 800 } } },
  ],
});
