import { expect, test, type Page } from '@playwright/test';

// All URLs end with "/": with trailingSlash 'always', `astro preview` returns 404 without it.

/** Starlight moves the theme and language selects into the mobile menu below 50rem (800px). */
const MOBILE_BREAKPOINT = 800;

function isNarrow(page: Page): boolean {
  return (page.viewportSize()?.width ?? MOBILE_BREAKPOINT) < MOBILE_BREAKPOINT;
}

/** Opens the mobile menu on narrow viewports so the preference selects become visible. */
async function showPreferences(page: Page): Promise<void> {
  if (isNarrow(page)) await page.locator('button.sl-menu-button').click();
}

function visibleSelect(page: Page, element: 'starlight-lang-select' | 'starlight-theme-select') {
  return page.locator(`${element} select`).filter({ visible: true });
}

test('/ redirects to /vi/', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('**/vi/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
});

test('pages declare the right language', async ({ page }) => {
  await page.goto('/vi/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('language select on /vi/ leads to /en/', async ({ page }) => {
  // Splash pages (home) have no sidebar, so Starlight renders no mobile menu and no language select there.
  test.skip(isNarrow(page), 'Starlight shows no language select on splash pages below 50rem');
  await page.goto('/vi/');
  await visibleSelect(page, 'starlight-lang-select').selectOption({ label: 'English' });
  await page.waitForURL('**/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('language select on a doc page keeps the same page', async ({ page }) => {
  await page.goto('/vi/dev/components/');
  await showPreferences(page);
  await visibleSelect(page, 'starlight-lang-select').selectOption({ label: 'English' });
  await page.waitForURL('**/en/dev/components/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('unknown page returns the bilingual 404', async ({ page }) => {
  const response = await page.goto('/vi/khong-co-trang-nay/');
  expect(response?.status()).toBe(404);
  await expect(page.getByText('Không tìm thấy trang').first()).toBeVisible();
  await expect(page.getByText('Page not found').first()).toBeVisible();
  await expect(page.locator('p[lang="en"]')).toContainText('does not exist');
});

test('KaTeX renders inline and display math', async ({ page }) => {
  await page.goto('/vi/dev/components/');
  expect(await page.locator('.katex').count()).toBeGreaterThanOrEqual(2);
  await expect(page.locator('.katex-display')).toHaveCount(1);
});

for (const path of ['/vi/', '/en/', '/vi/dev/components/']) {
  test(`no horizontal overflow on ${path}`, async ({ page }) => {
    await page.goto(path);
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
}

test('theme select switches to dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/vi/dev/components/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await showPreferences(page);
  await visibleSelect(page, 'starlight-theme-select').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
