// src/lib/site.ts: the one source of `site` (docs/architecture/launch.md, sections 3.3.1 and 8).
// astro.config.ts calls resolveSite(process.env.SITE_URL); a wrong value must stop the build, not end up in
// canonical, hreflang, the sitemap, robots.txt and og:image.
import { describe, expect, it } from 'vitest';
import { DEFAULT_SITE, resolveSite } from '../../../src/lib/site';

describe('resolveSite', () => {
  it('the default is the pages.dev origin', () => {
    expect(DEFAULT_SITE).toBe('https://ai-atlas.pages.dev');
  });

  it('undefined, empty or blank → the default', () => {
    expect(resolveSite(undefined)).toBe(DEFAULT_SITE);
    expect(resolveSite('')).toBe(DEFAULT_SITE);
    expect(resolveSite('   ')).toBe(DEFAULT_SITE);
    expect(resolveSite('\n\t')).toBe(DEFAULT_SITE);
  });

  it('an https origin comes back without the trailing slash and surrounding spaces', () => {
    expect(resolveSite('https://example.org')).toBe('https://example.org');
    expect(resolveSite('https://example.org/')).toBe('https://example.org');
    expect(resolveSite('  https://ai-atlas-xyz.pages.dev/  ')).toBe('https://ai-atlas-xyz.pages.dev');
    expect(resolveSite('https://example.org:8443')).toBe('https://example.org:8443');
  });

  it('the result never ends with "/" (new URL(path, site) must not double it)', () => {
    for (const raw of ['https://example.org', 'https://example.org/', 'http://localhost:4321/']) {
      expect(resolveSite(raw).endsWith('/'), raw).toBe(false);
    }
  });

  it('http is allowed for localhost and 127.0.0.1 only', () => {
    expect(resolveSite('http://localhost:4321')).toBe('http://localhost:4321');
    expect(resolveSite('http://localhost:4321/')).toBe('http://localhost:4321');
    expect(resolveSite('http://localhost')).toBe('http://localhost');
    expect(resolveSite('http://127.0.0.1:4322')).toBe('http://127.0.0.1:4322');
    expect(() => resolveSite('http://example.org')).toThrow(/SITE_URL/);
    expect(() => resolveSite('http://ai-atlas.pages.dev/')).toThrow(/https/);
    expect(() => resolveSite('http://localhost.example.org')).toThrow();
  });

  it.each([
    ['another protocol', 'ftp://x'],
    ['another protocol (file)', 'file:///C:/site'],
    ['not a URL', 'ai-atlas.pages.dev'],
    ['not a URL (relative)', '/vi/'],
    ['a path', 'https://example.org/ai-atlas'],
    ['a path with a trailing slash', 'https://example.org/ai-atlas/'],
    ['a query', 'https://example.org/?x=1'],
    ['an empty query', 'https://example.org/?'],
    ['a hash', 'https://example.org/#top'],
    ['an empty hash', 'https://example.org#'],
    ['a user name', 'https://user@example.org'],
    ['a password', 'https://user:secret@example.org'],
  ])('throws on %s: %s', (_, raw) => {
    expect(() => resolveSite(raw)).toThrow(/SITE_URL/);
  });

  it('the error names the bad value, so the build log says what to fix', () => {
    expect(() => resolveSite('ftp://x')).toThrow(/"ftp:\/\/x"/);
  });
});
