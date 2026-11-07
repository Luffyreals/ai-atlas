// Draws the two share pictures (Open Graph, 1200×630) into public/og/: `npm run og:images`.
// Run by hand when the tagline, the logo or the colours change, then commit the PNG files (and rename them,
// …-v2.png in src/data/og.ts, since social sites cache a picture by its URL). Build and CI never run it.
// docs/architecture/launch.md, section 3.3.3.
//
// A static HTML card set in Barlow from node_modules/@fontsource (the site's own CSS names its faces with a
// hash), photographed by Playwright's Chromium. Stops with an error rather than save a card in a fallback font.
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { OG_CARD, OG_IMAGE } from '../src/data/og.ts';

const root = new URL('../', import.meta.url);
const MAX_BYTES = 300 * 1024;

// The colours of src/styles/custom.css and src/assets/logo-light.svg. A picture, not a page: no light/dark.
const COLOUR = {
  ground: '#2b2216', // --atlas-ground
  groundInk: '#e4e2da', // --atlas-ground-ink
  groundMuted: '#b9ae9c', // --atlas-ground-muted
  field: '#c4a98f', // --atlas-field
};

/** A @fontsource stylesheet with its relative file URLs made absolute, so a page in the temp folder finds them. */
async function fontFaces(cssPath) {
  const css = await readFile(new URL(cssPath, root), 'utf8');
  const files = new URL(cssPath.replace(/[^/]+$/, 'files/'), root).href;
  return css.replaceAll('url(./files/', `url(${files}`).replaceAll('font-display: swap', 'font-display: block');
}

/** The logo, drawn at the size the CSS gives it. */
async function logo() {
  const svg = await readFile(new URL('src/assets/logo-light.svg', root), 'utf8');
  return svg.replace(/\s(width|height)="\d+"/g, '').replace(/<title>.*?<\/title>/s, '');
}

function cardHtml(locale, faces, mark) {
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<style>
${faces}
* { margin: 0; box-sizing: border-box; }
html, body { width: ${OG_IMAGE.width}px; height: ${OG_IMAGE.height}px; overflow: hidden; }
body {
  display: grid;
  grid-template-columns: 812px 1fr; /* 812 = 14.5 stripe periods: the neatline ends on a whole bar */
  background: ${COLOUR.ground};
  font-family: Barlow, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.ground { display: grid; grid-template-rows: 56px 1fr; }
/* The neatline of the homepage's title card (src/components/home/Stripe.astro): bars 28px wide. */
.stripe { display: block; width: 100%; height: 100%; color: ${COLOUR.groundInk}; }
.words {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 28px;
  padding: 64px 40px 72px 80px;
  color: ${COLOUR.groundInk};
}
.name {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 168px;
  line-height: 0.85;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}
.tagline { max-width: 640px; font-size: 52px; line-height: 1.12; }
.subline { font-size: 30px; line-height: 1.3; color: ${COLOUR.groundMuted}; }
.field { display: grid; place-items: center; background: ${COLOUR.field}; }
.field svg { width: 300px; height: auto; }
</style>
</head>
<body>
  <div class="ground">
    <svg class="stripe" aria-hidden="true">
      <defs><pattern id="stripe" width="56" height="10" patternUnits="userSpaceOnUse"><rect width="28" height="10" fill="currentColor"/></pattern></defs>
      <rect width="100%" height="100%" fill="url(#stripe)"/>
    </svg>
    <div class="words">
      <p class="name">AI Atlas</p>
      <p class="tagline">${OG_CARD.tagline[locale]}</p>
      <p class="subline">${OG_CARD.subline[locale]}</p>
    </div>
  </div>
  <div class="field">${mark}</div>
</body>
</html>`;
}

/** Width and height from the PNG's IHDR chunk. */
function pngSize(buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const faces = (
  await Promise.all(
    ['node_modules/@fontsource/barlow/400.css', 'node_modules/@fontsource/barlow-condensed/700.css'].map(fontFaces),
  )
).join('\n');
const mark = await logo();
const dir = await mkdtemp(join(tmpdir(), 'atlas-og-'));
const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { width: OG_IMAGE.width, height: OG_IMAGE.height }, deviceScaleFactor: 1 });
  for (const locale of /** @type {const} */ (['vi', 'en'])) {
    const htmlPath = join(dir, `card-${locale}.html`);
    await writeFile(htmlPath, cardHtml(locale, faces, mark));
    await page.goto(pathToFileURL(htmlPath).href);
    // load() resolves to the faces it found: none when the family is missing. check() then says whether every
    // face the words need (each subset) is ready.
    const loaded = await page.evaluate(async () => {
      const text = document.body.innerText;
      const fonts = ['700 100px "Barlow Condensed"', '400 40px Barlow'];
      const found = await Promise.all(fonts.map((font) => document.fonts.load(font, text)));
      await document.fonts.ready;
      return found.every((faces) => faces.length > 0) && fonts.every((font) => document.fonts.check(font, text));
    });
    if (!loaded) throw new Error(`Barlow did not load for the ${locale} card: not saving a picture in a fallback font.`);

    const out = fileURLToPath(new URL(`public${OG_IMAGE.path[locale]}`, root));
    const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: OG_IMAGE.width, height: OG_IMAGE.height } });
    const { width, height } = pngSize(png);
    if (width !== OG_IMAGE.width || height !== OG_IMAGE.height) throw new Error(`${out}: ${width}×${height}, expected ${OG_IMAGE.width}×${OG_IMAGE.height}.`);
    if (png.length >= MAX_BYTES) throw new Error(`${out}: ${png.length} bytes, over the ${MAX_BYTES} limit.`);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, png);
    console.log(`${out}  ${width}×${height}  ${Math.round((await stat(out)).size / 1024)} KB`);
  }
} finally {
  await browser.close();
  await rm(dir, { recursive: true, force: true });
}
