// public/_headers and public/_redirects for Cloudflare Pages (docs/architecture/launch.md, sections 3.7.1–3.7.2
// and 8). Cloudflare's format: a URL pattern at the start of a line, then indented "Name: value" lines; "#"
// starts a comment. Limits: 100 rules, 2 000 characters per line. A mistake here fails silently on deploy,
// so the file is parsed and checked here.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const read = (name: string) => readFileSync(fileURLToPath(new URL(`../../../public/${name}`, import.meta.url)), 'utf8');

type Rules = Map<string, [string, string][]>;

/** Parses the _headers format; throws on a line that fits nowhere. */
function parseHeaders(text: string): Rules {
  const rules: Rules = new Map();
  let current: [string, string][] | undefined;
  text.split(/\r?\n/).forEach((line, index) => {
    const where = `line ${index + 1}: "${line}"`;
    if (line.trim() === '' || line.trim().startsWith('#')) return;
    if (!/^\s/.test(line)) {
      const pattern = line.trim();
      if (!/^(\/|https:\/\/)\S*$/.test(pattern)) throw new Error(`not a URL pattern, ${where}`);
      if (rules.has(pattern)) throw new Error(`pattern listed twice, ${where}`);
      current = [];
      rules.set(pattern, current);
      return;
    }
    const match = /^\s+(!?[A-Za-z0-9-]+):\s*(.*\S)\s*$/.exec(line);
    if (!match) throw new Error(`not a "Name: value" header, ${where}`);
    if (!current) throw new Error(`header before any URL pattern, ${where}`);
    current.push([match[1]!, match[2]!]);
  });
  return rules;
}

const HEADERS = read('_headers');
const RULES = parseHeaders(HEADERS);
const header = (pattern: string, name: string) =>
  RULES.get(pattern)?.find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1];

describe('parseHeaders (the parser the tests below rely on)', () => {
  it('reads patterns and headers, and refuses a broken file', () => {
    const rules = parseHeaders('# c\n/a/*\n  X-One: 1\n\n/*\n  X-Two: two words\n');
    expect([...rules.keys()]).toEqual(['/a/*', '/*']);
    expect(rules.get('/*')).toEqual([['X-Two', 'two words']]);
    expect(() => parseHeaders('  X-One: 1\n')).toThrow(/before any URL pattern/);
    expect(() => parseHeaders('/a\n  no colon here\n')).toThrow(/Name: value/);
    expect(() => parseHeaders('a/*\n  X-One: 1\n')).toThrow(/URL pattern/);
    expect(() => parseHeaders('/a\n  X: 1\n/a\n  Y: 2\n')).toThrow(/twice/);
  });
});

describe('public/_headers', () => {
  it('parses, and every rule has at least one header', () => {
    expect(RULES.size).toBeGreaterThan(0);
    for (const [pattern, headers] of RULES) expect(headers.length, pattern).toBeGreaterThan(0);
  });

  it('stays within Cloudflare limits: at most 100 rules, every line under 2 000 characters', () => {
    expect(RULES.size).toBeLessThanOrEqual(100);
    for (const line of HEADERS.split(/\r?\n/)) expect(line.length, line.slice(0, 60)).toBeLessThan(2000);
  });

  it('/_astro/* (hashed file names) is cached for a year, immutable', () => {
    const cache = header('/_astro/*', 'Cache-Control');
    expect(cache).toBeDefined();
    expect(cache).toMatch(/\bpublic\b/);
    expect(cache).toMatch(/\bimmutable\b/);
    expect(Number(/max-age=(\d+)/.exec(cache ?? '')?.[1])).toBeGreaterThanOrEqual(31_536_000);
  });

  it('nothing else is cached as immutable: HTML, /pagefind/, /og/, sitemap and robots.txt have no hash', () => {
    for (const [pattern, headers] of RULES) {
      if (pattern === '/_astro/*') continue;
      for (const [name, value] of headers) {
        if (name.toLowerCase() === 'cache-control') expect(value, pattern).not.toMatch(/immutable/);
      }
    }
  });

  it('every page gets the security headers', () => {
    expect(header('/*', 'X-Content-Type-Options')).toBe('nosniff');
    expect(header('/*', 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header('/*', 'X-Frame-Options')).toBe('DENY');
  });

  it('no CSP (not even Report-Only), no HSTS, no COEP (decision 65; COEP would block Pyodide from jsDelivr)', () => {
    const names = [...RULES.values()].flat().map(([name]) => name.toLowerCase().replace(/^!/, ''));
    expect(names).not.toContain('content-security-policy');
    expect(names).not.toContain('content-security-policy-report-only');
    expect(names).not.toContain('strict-transport-security');
    expect(names).not.toContain('cross-origin-embedder-policy');
  });

  it('a header is not set twice in one rule', () => {
    for (const [pattern, headers] of RULES) {
      const names = headers.map(([name]) => name.toLowerCase());
      expect(new Set(names).size, pattern).toBe(names.length);
    }
  });
});

describe('public/_redirects', () => {
  it('keeps "/  /vi/  302" (a real HTTP redirect on Cloudflare; 302 so it can change later)', () => {
    const lines = read('_redirects')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'));
    expect(lines.map((line) => line.split(/\s+/))).toContainEqual(['/', '/vi/', '302']);
  });
});
