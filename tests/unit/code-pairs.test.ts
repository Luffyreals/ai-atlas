// Every example under src/code/ comes as <name>.vi.py + <name>.en.py (docs/architecture/components.md, 2.3).
// The two files differ in comments only. They must also keep the same line numbers, because the runner
// shows "Error on line N" and a lesson's text may point at a line.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const CODE_DIR = fileURLToPath(new URL('../../src/code/', import.meta.url));
const PAIR = /^(.*)\.(vi|en)\.py$/;

/** Paths relative to src/code/, with "/" separators. */
function listPythonFiles(): string[] {
  return readdirSync(CODE_DIR, { recursive: true, encoding: 'utf8' })
    .map((file) => file.split('\\').join('/'))
    .filter((file) => file.endsWith('.py'));
}

/**
 * Removes "#" comments: from "#" to the end of the line, unless the "#" is inside a string.
 * Handles '...', "...", '''...''', """...""" (with any prefix such as f or r) and backslash escapes.
 * Returns one entry per source line, trailing spaces removed; comment-only lines become "".
 */
function stripComments(source: string): string[] {
  const text = source.replace(/\r\n?/g, '\n');
  let out = '';
  let quote = ''; // the open string's delimiter, '' outside strings
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === '\\') {
        out += char + (text[i + 1] ?? '');
        i++;
      } else if (text.startsWith(quote, i)) {
        out += quote;
        i += quote.length - 1;
        quote = '';
      } else if (char === '\n' && quote.length === 1) {
        out += char; // unterminated one-line string: Python would refuse it anyway
        quote = '';
      } else {
        out += char;
      }
    } else if (char === '#') {
      while (i + 1 < text.length && text[i + 1] !== '\n') i++;
    } else if (char === '"' || char === "'") {
      quote = text.startsWith(char.repeat(3), i) ? char.repeat(3) : char;
      out += quote;
      i += quote.length - 1;
    } else {
      out += char;
    }
  }
  return out.split('\n').map((line) => line.trimEnd());
}

describe('stripComments', () => {
  it('keeps "#" inside strings and drops real comments', () => {
    expect(stripComments('x = "#1"  # count\nprint(\'a#b\')\n# only a comment\n')).toEqual([
      'x = "#1"',
      "print('a#b')",
      '',
      '',
    ]);
  });

  it('handles escapes and triple-quoted strings over several lines', () => {
    expect(stripComments('s = "say \\"#hi\\""  # c\nt = """a\n# not a comment\n"""  # c')).toEqual([
      's = "say \\"#hi\\""',
      't = """a',
      '# not a comment',
      '"""',
    ]);
  });
});

describe('src/code/ example pairs', () => {
  const files = listPythonFiles();

  it('has example files', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('names every file <name>.vi.py or <name>.en.py', () => {
    expect(files.filter((file) => !PAIR.test(file))).toEqual([]);
  });

  it('has an .en.py for every .vi.py and the other way round', () => {
    const missing = files
      .filter((file) => PAIR.test(file))
      .map((file) => file.replace(/\.(vi|en)\.py$/, (_, locale: string) => `.${locale === 'vi' ? 'en' : 'vi'}.py`))
      .filter((partner) => !files.includes(partner));
    expect(missing).toEqual([]);
  });

  const viFiles = files.filter((file) => file.endsWith('.vi.py'));
  it.each(viFiles)('%s and its .en.py differ in comments only, line for line', (viFile) => {
    const enFile = viFile.replace(/\.vi\.py$/, '.en.py');
    const vi = stripComments(readFileSync(join(CODE_DIR, viFile), 'utf8'));
    const en = stripComments(readFileSync(join(CODE_DIR, enFile), 'utf8'));
    expect(en).toEqual(vi);
  });
});
