// M4 launch checks that read the DOM, the HTML or the network, not the layout (docs/architecture/launch.md,
// section 8, items 1–3, 7, 9): the About page, the footer note, share tags and robots.txt, the 404 head,
// fonts (preload, no font CDN, real faces) and the logo. Desktop project only (*-meta.spec.ts); the 375px,
// light and dark checks are in launch.spec.ts. All URLs end with "/" (trailingSlash 'always').
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page, type Request } from '@playwright/test';
import { CC_LICENCE_URL, HOME } from '../../src/data/home';
import { OG_IMAGE, OG_LOCALE } from '../../src/data/og';
import { LOCALES, type Locale } from '../../src/data/roadmap';
import { isTranslated } from '../../src/lib/roadmap';
import { s, scrollThrough } from './helpers';
import { WITH_PAGE } from './lesson-pages';

/** The built `site` (astro.config.ts, resolveSite(undefined)): e2e builds without SITE_URL. */
const SITE = 'https://ai-atlas.pages.dev';
const ABOUT_TITLE: Record<Locale, string> = { vi: 'Giới thiệu', en: 'About' };
const SAMPLE = 'ml/linear-regression';
/** A lesson with a vi file and no en file: /en/<id>/ is Starlight's fallback page, showing the vi text. */
const FALLBACK = WITH_PAGE.find((lesson) => !isTranslated(lesson, 'en'));
const NOT_FOUND = '/khong-co-trang-nay/';
const other = (locale: Locale): Locale => (locale === 'vi' ? 'en' : 'vi');

// Playwright cannot load src/data/home-pictures.ts (it imports .jpg files), so the credits are counted in its
// source: one `source: 'https://…'` per picture (unique: home-data.test.ts), one `licenceUrl:` per CC credit.
const PICTURES_SOURCE = readFileSync(fileURLToPath(new URL('../../src/data/home-pictures.ts', import.meta.url)), 'utf8');
/** Distinct picture sources: one credit line each (PictureCredits). */
const CREDIT_COUNT = new Set([...PICTURES_SOURCE.matchAll(/source: '(https:\/\/[^']+)'/g)].map((m) => m[1])).size;
/** Credits that link their licence (the David Rumsey scans, CC BY-NC-SA 3.0). */
const CC_CREDITS = [...PICTURES_SOURCE.matchAll(/\blicenceUrl: [A-Z_']/g)].length;

test('the picture credit counts read from home-pictures.ts are plausible', () => {
  expect(CREDIT_COUNT).toBeGreaterThanOrEqual(10);
  expect(CC_CREDITS).toBe(2);
});

const meta = (page: Page, key: 'property' | 'name', value: string) =>
  page.locator(`meta[${key}="${value}"]`).evaluateAll((items) => items.map((item) => item.getAttribute('content')));

// --- 1. About page ---

for (const locale of LOCALES) {
  const path = `/${locale}/about/`;

  test.describe(`About ${path}`, () => {
    test('one h1, title, description, html lang, canonical, hreflang vi + en + x-default, not noindex', async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1#_top')).toHaveText(ABOUT_TITLE[locale]);
      await expect(page).toHaveTitle(`${ABOUT_TITLE[locale]} | AI Atlas`);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.trim()).toBeTruthy();
      expect(description).not.toBe('Bản đồ kiến thức AI song ngữ Việt – Anh.'); // its own, not the site's

      const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((links) =>
        links.map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]),
      );
      expect(alternates.sort()).toEqual(
        [
          ['en', `${SITE}/en/about/`],
          ['vi', `${SITE}/vi/about/`],
          ['x-default', `${SITE}/vi/about/`],
        ].sort(),
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator('[data-pagefind-body]')).toHaveCount(1);
    });

    test('not in the sidebar, no Previous/Next', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(`#starlight__sidebar a[href="${path}"]`)).toHaveCount(0);
      await expect(page.locator('#starlight__sidebar a[aria-current="page"]')).toHaveCount(0);
      await expect(page.locator('.pagination-links a')).toHaveCount(0);
    });

    test('licences: CC link with rel="license" (canonical URI), MIT link; picture credits; no repo link', async ({ page }) => {
      await page.goto(path);
      const content = page.locator('.sl-markdown-content');
      const licence = content.locator('a[rel="license"]');
      await expect(licence).toHaveCount(1);
      await expect(licence).toHaveAttribute('href', CC_LICENCE_URL[locale]);
      await expect(licence).toHaveText('CC BY-NC-SA 4.0');
      await expect(content.locator('a[href="https://opensource.org/license/mit"]')).toHaveCount(1);

      const credits = content.locator('.picture-credits > li');
      await expect(credits).toHaveCount(CREDIT_COUNT);
      // The two David Rumsey scans link their own licence, CC BY-NC-SA 3.0 (decision 66).
      const cc3 = content.locator('.picture-credits a[href="https://creativecommons.org/licenses/by-nc-sa/3.0/"]');
      await expect(cc3).toHaveCount(CC_CREDITS);
      for (const link of await cc3.all()) await expect(link).toHaveText('CC BY-NC-SA 3.0');
      // Titles keep their own language.
      await expect(content.locator('.picture-credits > li > a[lang="en"]')).toHaveCount(CREDIT_COUNT);

      await expect(page.locator('a[href*="github.com/Luffyreals/ai-atlas" i]')).toHaveCount(0);
      // No link into a file of the private repo.
      const hrefs = await content.locator('a[href]').evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
      expect(hrefs.filter((href) => /\.(md|mdx)(#|$)/.test(href) || href.includes('github.com'))).toEqual([]);
    });

    test('in sitemap-0.xml, with xhtml:link to both languages', async ({ request }) => {
      const xml = await (await request.get('/sitemap-0.xml')).text();
      const entry = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
        .map((match) => match[1]!)
        .find((url) => url.includes(`<loc>${SITE}${path}</loc>`));
      expect(entry, `${path} in the sitemap`).toBeDefined();
      expect(entry).toContain(`hreflang="${other(locale)}" href="${SITE}/${other(locale)}/about/"`);
      expect(entry).toContain(`hreflang="${locale}" href="${SITE}${path}"`);
    });
  });
}

// --- 2. Footer note (DOM; 375px, light and dark in launch.spec.ts) ---

function siteNote(page: Page) {
  return page.locator('.atlas-site-note');
}

for (const [locale, path] of [
  ['vi', `/vi/${SAMPLE}/`],
  ['en', `/en/${SAMPLE}/`],
  ['vi', '/vi/about/'],
  ['en', '/en/about/'],
  ['vi', '/vi/dev/components/'],
] as const) {
  test(`footer note on ${path}: one line in ${locale}, licence link and About link`, async ({ page }) => {
    await page.goto(path);
    const note = siteNote(page);
    await expect(note).toHaveCount(1);
    // Inside <main>, after Starlight's own footer.
    await expect(page.locator('main .atlas-site-note')).toHaveCount(1);
    const lines = note.locator('p');
    await expect(lines).toHaveCount(1);
    await expect(lines).toHaveAttribute('lang', locale);
    const licence = note.locator('a[rel="license"]');
    await expect(licence).toHaveCount(1);
    await expect(licence).toHaveAttribute('href', CC_LICENCE_URL[locale]);
    await expect(licence).toHaveText('CC BY-NC-SA 4.0');
    await expect(lines).toContainText(`${s(locale, 'footer.contentLicence')} CC BY-NC-SA 4.0. ${s(locale, 'footer.codeLicence')}`);
    const about = note.getByRole('link', { name: s(locale, 'footer.about'), exact: true });
    await expect(about).toHaveAttribute('href', `/${locale}/about/`);
    // Starlight's own footer is still rendered above it.
    await expect(page.locator('main footer .pagination-links')).toHaveCount(1);
  });
}

test('footer note on a lesson keeps Starlight\'s Previous/Next', async ({ page }) => {
  await page.goto(`/vi/${SAMPLE}/`);
  expect(await page.locator('.pagination-links a[rel="prev"], .pagination-links a[rel="next"]').count()).toBeGreaterThan(0);
});

test('footer note on a fallback page (/en/<vi-only lesson>/): English, lang="en" inside <main lang="vi">', async ({ page }) => {
  test.skip(!FALLBACK, 'every lesson with a page has its en file');
  await page.goto(`/en/${FALLBACK!.id}/`);
  await expect(page.locator('main')).toHaveAttribute('lang', 'vi');
  const lines = siteNote(page).locator('p');
  await expect(lines).toHaveCount(1);
  await expect(lines).toHaveAttribute('lang', 'en');
  await expect(lines).toContainText(s('en', 'footer.contentLicence'));
  await expect(lines).toContainText(s('en', 'footer.codeLicence'));
  await expect(lines.getByRole('link', { name: 'About', exact: true })).toHaveAttribute('href', '/en/about/');
  await expect(lines.locator('a[rel="license"]')).toHaveAttribute('href', CC_LICENCE_URL.en);
});

test('footer note on the 404 page: two lines, vi then en (lang="en")', async ({ page }) => {
  const response = await page.goto(NOT_FOUND);
  expect(response?.status()).toBe(404);
  const lines = siteNote(page).locator('p');
  await expect(lines).toHaveCount(2);
  await expect(lines.nth(0)).toHaveAttribute('lang', 'vi');
  await expect(lines.nth(1)).toHaveAttribute('lang', 'en');
  await expect(lines.nth(0)).toContainText(s('vi', 'footer.contentLicence'));
  await expect(lines.nth(1)).toContainText(s('en', 'footer.contentLicence'));
  await expect(lines.nth(0).locator('a[href="/vi/about/"]')).toHaveText(s('vi', 'footer.about'));
  await expect(lines.nth(1).locator('a[href="/en/about/"]')).toHaveText(s('en', 'footer.about'));
  await expect(siteNote(page).locator('a[rel="license"]')).toHaveCount(2);
});

for (const locale of LOCALES) {
  test(`/${locale}/: no footer note; HomeFooter links About; two rel="license" links (letter and footer)`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    await expect(siteNote(page)).toHaveCount(0);
    const footer = page.locator('footer.postcard-wrap');
    await expect(footer.getByRole('link', { name: HOME.footer.linkAbout[locale], exact: true })).toHaveAttribute(
      'href',
      `/${locale}/about/`,
    );
    // HomeLetter and HomeFooter both carry the licence; both the canonical URI (decision 66, no deed.vi).
    const licences = page.locator('a[rel="license"]');
    await expect(licences).toHaveCount(2);
    for (const link of await licences.all()) await expect(link).toHaveAttribute('href', CC_LICENCE_URL[locale]);
    await expect(footer.locator('a[rel="license"]')).toHaveCount(1);
    await expect(page.locator('a[href*="deed."]')).toHaveCount(0);
    // Picture credits: the Rumsey scans link CC BY-NC-SA 3.0 here too.
    await expect(
      page.locator('.picture-credits a[href="https://creativecommons.org/licenses/by-nc-sa/3.0/"]'),
    ).toHaveCount(CC_CREDITS);
    await expect(page.locator('.picture-credits > li')).toHaveCount(CREDIT_COUNT);
  });
}

// --- 3. SEO: share tags, robots.txt, 404 head ---

const SHARE_PAGES: [Locale, string][] = LOCALES.flatMap((locale) => [
  [locale, `/${locale}/`],
  [locale, `/${locale}/${SAMPLE}/`],
  [locale, `/${locale}/about/`],
]);

/** Width and height of an image, as the browser decodes it. */
async function naturalSize(page: Page, src: string): Promise<{ width: number; height: number }> {
  return page.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { width: img.naturalWidth, height: img.naturalHeight };
  }, src);
}

for (const [locale, path] of SHARE_PAGES) {
  test(`share tags on ${path}: absolute og:image (1200×630 PNG that loads), twitter:image, og:locale`, async ({
    page,
    request,
  }) => {
    await page.goto(path);
    const [image] = await meta(page, 'property', 'og:image');
    expect(await meta(page, 'property', 'og:image')).toHaveLength(1);
    expect(image).toBe(`${SITE}${OG_IMAGE.path[locale]}`);
    expect(image!.startsWith(`${SITE}/og/`)).toBe(true);

    // Fetch it from the preview server: same path, the test's origin.
    const local = new URL(image!).pathname;
    const response = await request.get(local);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^image\/png/);
    expect(await naturalSize(page, local)).toEqual({ width: 1200, height: 630 });

    expect(await meta(page, 'property', 'og:image:width')).toEqual(['1200']);
    expect(await meta(page, 'property', 'og:image:height')).toEqual(['630']);
    expect(await meta(page, 'property', 'og:image:type')).toEqual(['image/png']);
    const [alt] = await meta(page, 'property', 'og:image:alt');
    expect(alt?.trim()).toBeTruthy();
    expect(alt).toBe(OG_IMAGE.alt[locale]);
    expect(await meta(page, 'name', 'twitter:card')).toEqual(['summary_large_image']);
    expect(await meta(page, 'name', 'twitter:image')).toEqual([image]);
    expect(await meta(page, 'name', 'twitter:image:alt')).toEqual([alt]);
    expect(await meta(page, 'property', 'og:locale')).toEqual([OG_LOCALE[locale]]);
    expect(await meta(page, 'property', 'og:locale:alternate')).toEqual([OG_LOCALE[other(locale)]]);
    expect(await meta(page, 'property', 'og:type')).toEqual([path === `/${locale}/` ? 'website' : 'article']);
    expect(await meta(page, 'property', 'og:url')).toEqual([`${SITE}${path}`]);
  });
}

test('share tags on a fallback page: og:locale vi_VN (vi text), no en_US alternate, vi picture', async ({ page }) => {
  test.skip(!FALLBACK, 'every lesson with a page has its en file');
  await page.goto(`/en/${FALLBACK!.id}/`);
  expect(await meta(page, 'property', 'og:locale')).toEqual(['vi_VN']);
  expect(await meta(page, 'property', 'og:locale:alternate')).toEqual([]);
  expect(await meta(page, 'property', 'og:image')).toEqual([`${SITE}${OG_IMAGE.path.vi}`]);
  // Its vi page does not advertise an English version either.
  await page.goto(`/vi/${FALLBACK!.id}/`);
  expect(await meta(page, 'property', 'og:locale')).toEqual(['vi_VN']);
  expect(await meta(page, 'property', 'og:locale:alternate')).toEqual([]);
});

test('/robots.txt: 200, text/plain, Sitemap on the site, nothing disallowed', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/^text\/plain/);
  const text = await response.text();
  expect(text).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  expect(text).toMatch(/^User-agent: \*$/m);
  expect(text).not.toMatch(/^Disallow:\s*\/\s*$/m);
  // The sitemap it names exists.
  expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
});

test('/404.html: noindex; no canonical, og:url or hreflang (they would name pages that do not exist)', async ({
  page,
}) => {
  await page.goto('/404.html');
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('link[hreflang]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
  // No translation of a missing page: no og:locale:alternate; og:locale and the share picture stay.
  await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'vi_VN');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  // The same head on a real miss.
  const response = await page.goto(NOT_FOUND);
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"], link[hreflang]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveCount(0);
});

// --- 7. Fonts (Fonts API: docs/architecture/launch.md, section 3.4) ---

/** Pages and how many Barlow 400 files they preload: 3 subsets for vi text, latin only for en text. */
const PRELOADS: [string, number][] = [
  [`/vi/${SAMPLE}/`, 3],
  [`/en/${SAMPLE}/`, isTranslated(WITH_PAGE.find((l) => l.id === SAMPLE)!, 'en') ? 1 : 3],
  ['/vi/about/', 3],
  ['/en/about/', 1],
  ['/vi/', 3],
  ['/en/', 1],
  ...(FALLBACK ? ([[`/en/${FALLBACK.id}/`, 3]] as [string, number][]) : []),
  [NOT_FOUND, 3],
];

/** Requests that would fetch a font from outside the site (the old @fontsource CSS, a font CDN). */
const FONT_CDN = /fontsource|fonts\.googleapis|fonts\.gstatic|use\.typekit|fonts\.bunny/i;

interface FaceRule {
  family: string;
  src: string;
  weight: string;
  style: string;
  range: string;
}

/** @font-face rules of the <style> blocks in <head> (where <Font> puts them). */
async function headFaces(page: Page): Promise<FaceRule[]> {
  return page.evaluate(() =>
    [...document.head.querySelectorAll('style')].flatMap((style) =>
      [...(style.sheet?.cssRules ?? [])]
        .filter((rule): rule is CSSFontFaceRule => rule instanceof CSSFontFaceRule)
        .map((rule) => ({
          family: rule.style.getPropertyValue('font-family').replace(/^["']|["']$/g, ''),
          src: /url\("?([^")]+)"?\)/.exec(rule.style.getPropertyValue('src'))?.[1] ?? '',
          weight: rule.style.getPropertyValue('font-weight'),
          style: rule.style.getPropertyValue('font-style'),
          range: rule.style.getPropertyValue('unicode-range'),
        })),
    ),
  );
}

/** The first family of a CSS variable set by <Font>, e.g. "Barlow-afe7ef169af9117d". */
async function familyOf(page: Page, variable: string): Promise<string> {
  const value = await page.evaluate((name) => getComputedStyle(document.documentElement).getPropertyValue(name), variable);
  const first = value.split(',')[0]?.trim().replace(/^["']|["']$/g, '') ?? '';
  expect(first, `${variable}: "${value}"`).toMatch(/^Barlow/);
  return first;
}

for (const [path, count] of PRELOADS) {
  test(`fonts on ${path}: ${count} preload(s) of Barlow 400 from /_astro/, crossorigin; no font from outside`, async ({
    page,
  }) => {
    const requests: Request[] = [];
    page.on('request', (request) => requests.push(request));
    await page.goto(path);
    const preloads = await page.locator('link[rel="preload"][as="font"]').evaluateAll((links) =>
      links.map((link) => ({
        href: link.getAttribute('href') ?? '',
        crossorigin: link.hasAttribute('crossorigin'),
        type: link.getAttribute('type'),
      })),
    );
    expect(preloads).toHaveLength(count);
    for (const preload of preloads) {
      expect(preload.href).toMatch(/^\/_astro\/.+\.woff2$/);
      expect(preload.crossorigin, preload.href).toBe(true);
      expect(preload.type).toBe('font/woff2');
    }

    // Each preload is one of the Barlow 400 upright faces of this page (not Condensed, not 600, not italic).
    const barlow = await familyOf(page, '--font-barlow');
    const faces = await headFaces(page);
    const body = faces.filter((face) => face.family === barlow && face.weight === '400' && face.style === 'normal');
    expect(body.length, 'Barlow 400 faces: latin, latin-ext, vietnamese').toBe(3);
    for (const preload of preloads) expect(body.map((face) => face.src), preload.href).toContain(preload.href);
    // en text: only the latin file (its range starts at U+0000); vi text adds latin-ext and vietnamese.
    if (count === 1) {
      const latin = body.find((face) => /U\+0+-0*FF\b/i.test(face.range));
      expect(preloads[0]!.href).toBe(latin?.src);
    }

    await scrollThrough(page, { networkIdle: true });
    const urls = requests.map((request) => request.url());
    expect(urls.filter((url) => FONT_CDN.test(url))).toEqual([]);
    const fonts = requests.filter((request) => request.resourceType() === 'font').map((request) => new URL(request.url()));
    expect(fonts.length).toBeGreaterThan(0);
    for (const url of fonts) expect(`${url.origin}${url.pathname}`).toMatch(/^http:\/\/localhost:\d+\/_astro\//);
  });
}

test('fonts: every face is a real file (no synthesised bold or italic), Barlow on body text, metric-matched fallbacks', async ({
  page,
}) => {
  await page.goto(`/vi/${SAMPLE}/`);
  await page.evaluate(() => document.fonts.ready);
  const barlow = await familyOf(page, '--font-barlow');
  const condensed = await familyOf(page, '--font-barlow-condensed');
  expect(condensed).toMatch(/^Barlow Condensed/);

  // The family name has a hash, so check('16px Barlow') would not name it: use the name from the variable.
  // load() fetches the face (Vietnamese letters: the vietnamese subset too); check() is then true.
  const SAMPLE_TEXT = 'Học máy ăn đủ ỹ';
  for (const font of [`16px "${barlow}"`, `600 16px "${barlow}"`, `italic 16px "${barlow}"`, `700 32px "${condensed}"`]) {
    const loaded = await page.evaluate(
      async ([spec, text]) => {
        const faces = await document.fonts.load(spec!, text);
        return { faces: faces.map((face) => `${face.weight} ${face.style} ${face.status}`), check: document.fonts.check(spec!, text) };
      },
      [font, SAMPLE_TEXT],
    );
    expect(loaded.faces.length, `${font}: faces`).toBeGreaterThan(0);
    expect(loaded.faces.every((face) => face.endsWith(' loaded')), `${font}: ${loaded.faces.join(', ')}`).toBe(true);
    expect(loaded.check, `${font}: document.fonts.check`).toBe(true);
  }

  // The faces declared: exactly 400, 600, 400 italic for Barlow and 700 for Condensed, three subsets each.
  const faces = await headFaces(page);
  const combos = (family: string) =>
    [...new Set(faces.filter((face) => face.family === family).map((face) => `${face.weight} ${face.style}`))].sort();
  expect(combos(barlow)).toEqual(['400 italic', '400 normal', '600 normal']);
  expect(combos(condensed)).toEqual(['700 normal']);
  expect(faces.filter((face) => face.family === barlow)).toHaveLength(9);
  expect(faces.filter((face) => face.family === condensed)).toHaveLength(3);

  // Body text and the title use them.
  const firstParagraph = await page.locator('.sl-markdown-content > p').first().evaluate((p) => getComputedStyle(p).fontFamily);
  expect(firstParagraph.replace(/^["']/, '')).toMatch(/^Barlow/);
  expect(firstParagraph).toContain(barlow);

  // Fallback faces sized to Barlow's metrics (size-adjust) in an inline <style> of <head>.
  const fallbacks = await page.evaluate(() =>
    [...document.head.querySelectorAll('style')].flatMap((style) =>
      [...(style.sheet?.cssRules ?? [])]
        .filter((rule): rule is CSSFontFaceRule => rule instanceof CSSFontFaceRule)
        .filter((rule) => rule.style.getPropertyValue('size-adjust') !== '')
        .map((rule) => rule.style.getPropertyValue('font-family')),
    ),
  );
  expect(fallbacks.length).toBeGreaterThan(0);
  expect(fallbacks.some((family) => family.includes(`${barlow} fallback`))).toBe(true);

  // The old @fontsource CSS is gone from the site's stylesheets.
  const sheetFaces = await page.evaluate(() =>
    [...document.styleSheets]
      .filter((sheet) => sheet.href)
      .flatMap((sheet) => [...sheet.cssRules].filter((rule) => rule instanceof CSSFontFaceRule))
      .map((rule) => (rule as CSSFontFaceRule).style.getPropertyValue('font-family'))
      .filter((family) => /barlow/i.test(family)),
  );
  expect(sheetFaces).toEqual([]);
});

// --- 9. Logo ---

for (const locale of LOCALES) {
  test(`/${locale}/ header: logo images are decorative (alt=""), the home link is named "AI Atlas"`, async ({ page }) => {
    await page.goto(`/${locale}/about/`);
    const logos = page.locator('header a.site-title img');
    expect(await logos.count()).toBeGreaterThan(0);
    for (const img of await logos.all()) await expect(img).toHaveAttribute('alt', '');
    const home = page.locator('header').getByRole('link', { name: 'AI Atlas', exact: true });
    await expect(home).toHaveCount(1);
    await expect(home).toHaveAttribute('href', `/${locale}/`);
  });
}

// --- Cloudflare files reach dist/ unchanged (docs/architecture/launch.md M4-4) ---

test('dist/_headers and dist/_redirects are the files of public/', () => {
  const read = (path: string) => readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8');
  for (const name of ['_headers', '_redirects']) expect(read(`dist/${name}`), name).toBe(read(`public/${name}`));
});
