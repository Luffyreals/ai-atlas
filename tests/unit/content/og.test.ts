// The share pictures (docs/architecture/launch.md, sections 3.3.2–3.3.3 and 8): public/og/*.png, made by
// scripts/make-og-images.mjs from src/data/og.ts. The PNG header is read by hand (no package): signature,
// then the IHDR chunk with width and height as big-endian 32-bit numbers at bytes 16 and 20.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { HOME } from '../../../src/data/home';
import { OG_CARD, OG_IMAGE, OG_LOCALE } from '../../../src/data/og';
import { LOCALES } from '../../../src/data/roadmap';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const MAX_BYTES = 300 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Width and height from the IHDR chunk of a PNG; throws when the file is not a PNG. */
function pngSize(bytes: Buffer): { width: number; height: number } {
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error('not a PNG');
  if (bytes.toString('latin1', 12, 16) !== 'IHDR') throw new Error('first chunk is not IHDR');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('pngSize (the reader the tests below rely on)', () => {
  it('reads a hand-made IHDR, and refuses a file that is not a PNG', () => {
    const header = Buffer.alloc(24);
    PNG_SIGNATURE.copy(header, 0);
    header.writeUInt32BE(13, 8);
    header.write('IHDR', 12, 'latin1');
    header.writeUInt32BE(1200, 16);
    header.writeUInt32BE(630, 20);
    expect(pngSize(header)).toEqual({ width: 1200, height: 630 });
    header.writeUInt32BE(631, 20);
    expect(pngSize(header)).toEqual({ width: 1200, height: 631 });
    expect(() => pngSize(Buffer.from('GIF89a................'))).toThrow();
  });
});

describe('Open Graph pictures in public/og/', () => {
  for (const locale of LOCALES) {
    const path = OG_IMAGE.path[locale];
    const file = join(PUBLIC, path);

    it(`${locale}: ${path} exists, is a ${OG_IMAGE.width}×${OG_IMAGE.height} PNG under 300 KB`, () => {
      expect(path).toMatch(/^\/og\/[\w-]+\.png$/);
      expect(existsSync(file), file).toBe(true);
      expect(pngSize(readFileSync(file))).toEqual({ width: OG_IMAGE.width, height: OG_IMAGE.height });
      expect(statSync(file).size).toBeLessThan(MAX_BYTES);
    });
  }

  it('the size and type in og.ts are the ones the share sites expect', () => {
    expect(OG_IMAGE.width).toBe(1200);
    expect(OG_IMAGE.height).toBe(630);
    expect(OG_IMAGE.type).toBe('image/png');
  });

  it('one picture per language, not the same file', () => {
    expect(OG_IMAGE.path.vi).not.toBe(OG_IMAGE.path.en);
    expect(readFileSync(join(PUBLIC, OG_IMAGE.path.vi)).equals(readFileSync(join(PUBLIC, OG_IMAGE.path.en)))).toBe(false);
  });
});

describe('src/data/og.ts', () => {
  it('the tagline on the card is the homepage hero title (rerun npm run og:images when it changes)', () => {
    for (const locale of LOCALES) expect(OG_CARD.tagline[locale], locale).toBe(HOME.hero.title[locale]);
  });

  it('every text is filled in both languages, and the alt names the site and the tagline', () => {
    for (const locale of LOCALES) {
      expect(OG_CARD.subline[locale].trim(), locale).not.toBe('');
      expect(OG_IMAGE.alt[locale]).toContain('AI Atlas');
      expect(OG_IMAGE.alt[locale]).toContain(OG_CARD.tagline[locale]);
    }
    expect(OG_LOCALE).toEqual({ vi: 'vi_VN', en: 'en_US' });
  });

  it('has only `import type` (scripts/make-og-images.mjs loads it through Node type stripping)', () => {
    const source = readFileSync(join(ROOT, 'src/data/og.ts'), 'utf8');
    const imports = source.split('\n').filter((line) => /^\s*import\b/.test(line));
    expect(imports.length).toBeGreaterThan(0);
    for (const line of imports) expect(line, line).toMatch(/^\s*import\s+type\s/);
    // No dynamic import, require, or `export … from`, which Node would also load at run time.
    expect(source).not.toMatch(/\bimport\s*\(|\brequire\s*\(|^\s*export\s[^=]*\sfrom\s/m);
    // No TypeScript that type stripping cannot erase (enum, namespace, parameter properties).
    expect(source).not.toMatch(/^\s*(export\s+)?(const\s+)?enum\s|^\s*(export\s+)?namespace\s/m);
  });

  it('the OG script reads og.ts and writes the files og.ts names', () => {
    const script = readFileSync(join(ROOT, 'scripts/make-og-images.mjs'), 'utf8');
    expect(script).toMatch(/src\/data\/og\.ts/);
    expect(script).toContain('OG_IMAGE');
    expect(script).toContain('OG_CARD');
  });
});
