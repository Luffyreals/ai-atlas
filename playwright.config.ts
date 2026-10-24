import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

// 4322, not Astro's default 4321: `npm run dev` often runs there, and with reuseExistingServer the e2e
// tests would quietly run against the dev server. "localhost", since preview may listen on [::1] only.
// E2E_PORT: another port, when another worktree of the repo runs its e2e tests at the same time; on the same
// port, reuseExistingServer would quietly test that worktree's dist/ (seen on 24/10/2026: ai-atlas-gd).
const PORT = Number(process.env.E2E_PORT ?? 4322);
if (!Number.isInteger(PORT) || PORT < 1024 || PORT > 65535) throw new Error(`E2E_PORT must be a port number, not "${process.env.E2E_PORT}"`);

// E2E_PREBUILT=1: dist/ was built already (in CI, by the verify job, and downloaded as an artifact), so the
// web server only runs `astro preview`. Without it, the site is built first (docs/architecture/llm-lessons.md
// section 2.10, E3).
const PREBUILT = ['1', 'true'].includes(process.env.E2E_PREBUILT ?? '');
if (PREBUILT && !existsSync(fileURLToPath(new URL('./dist/index.html', import.meta.url)))) {
  throw new Error('E2E_PREBUILT is set, but there is no dist/index.html: run `npm run build` or download dist/ first.');
}

// Files named *-meta.spec.ts hold tests that read the DOM, the HTML or dist/, not the layout: the mobile
// project skips them, since they would give the same result at 375px (section 2.10, E1).
const META_SPECS = /-meta\.spec\.ts$/;

// Astro 7 refuses to start a second `astro preview` of the same project while one is running (a lock file):
// any preview left open (`npm run preview`, a manual check on another port) would stop the e2e run with
// "Another astro preview server is already running". --ignore-lock starts this one alongside, untracked.
const PREVIEW = `npm run preview -- --port ${PORT} --ignore-lock`;

export default defineConfig({
  testDir: 'tests/e2e',
  // Spread the tests of one file over workers and shards, test by test (lessons.spec.ts is one large file).
  fullyParallel: true,
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: PREBUILT ? PREVIEW : `npm run build && ${PREVIEW}`,
    url: `http://localhost:${PORT}/vi/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 800 } },
      testIgnore: META_SPECS,
    },
  ],
});
