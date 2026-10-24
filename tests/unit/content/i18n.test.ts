import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ALL_UI_KEYS } from '../../../src/i18n/ui';

function readStrings(locale: 'vi' | 'en'): Record<string, string> {
  const file = fileURLToPath(new URL(`../../../src/content/i18n/${locale}.json`, import.meta.url));
  return JSON.parse(readFileSync(file, 'utf8')) as Record<string, string>;
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((match) => match[1] ?? '').sort();
}

const vi = readStrings('vi');
const en = readStrings('en');

describe('UI strings', () => {
  it('vi.json and en.json have the same keys', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort());
  });

  it('atlas.* keys match ALL_UI_KEYS exactly', () => {
    const expected = [...ALL_UI_KEYS].sort();
    for (const strings of [vi, en]) {
      expect(Object.keys(strings).filter((key) => key.startsWith('atlas.')).sort()).toEqual(expected);
    }
  });

  it('has no empty values', () => {
    for (const [key, value] of [...Object.entries(vi), ...Object.entries(en)]) {
      expect(value.trim(), key).not.toBe('');
    }
  });

  it('uses the same {{placeholders}} in vi and en', () => {
    for (const key of Object.keys(vi)) {
      expect(placeholders(en[key] ?? ''), key).toEqual(placeholders(vi[key] ?? ''));
    }
  });
});
