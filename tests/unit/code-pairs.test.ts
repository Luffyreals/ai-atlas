// Every example under src/code/ comes as <name>.vi.py + <name>.en.py (docs/architecture/components.md, 2.3).
// The two files differ in comments only. They must also keep the same line numbers, because the runner
// shows "Error on line N" and a lesson's text may point at a line.
// Under src/code/llm/ they may also differ in the text of their strings: prompts and printed text are
// Vietnamese in .vi.py and English in .en.py (decision 59; docs/architecture/llm-lessons.md, 2.4 and 4.5).
// Once a lesson is translated (status.en 'published'), its .en.py files hold no Vietnamese, except strings
// marked as Vietnamese data with a "# data: vi" comment (llm-lessons.md 4.5).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../src/data/roadmap';
import { blankStrings, scanPython, stripComments, vietnameseOutsideData } from './fixtures/python-source';

const CODE_DIR = fileURLToPath(new URL('../../src/code/', import.meta.url));
const PAIR = /^(.*)\.(vi|en)\.py$/;
/** Files whose strings may differ between the two languages. */
const STRING_RULE_DIR = 'llm/';

/** Paths relative to src/code/, with "/" separators. */
function listPythonFiles(): string[] {
  return readdirSync(CODE_DIR, { recursive: true, encoding: 'utf8' })
    .map((file) => file.split('\\').join('/'))
    .filter((file) => file.endsWith('.py'));
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

  it('drops the comment, not a look-alike inside a string on the same line', () => {
    expect(stripComments('x = "# c"  # c\n')).toEqual(['x = "# c"', '']);
  });
});

describe('blankStrings (src/code/llm/ pairs)', () => {
  it('empties single- and double-quoted strings, keeps prefixes and code', () => {
    expect(blankStrings(`a = 'xin chào'\nb = "hello" + f"x"\nc = rb'\\x00'`)).toEqual([
      "a = ''",
      'b = "" + f""',
      "c = rb''",
    ]);
  });

  it('empties a triple-quoted string but keeps its line breaks, so later lines keep their numbers', () => {
    expect(blankStrings('s = """Bạn là\ntrợ lý"""\nprint(s)\n')).toEqual(['s = """', '"""', 'print(s)', '']);
    expect(blankStrings("s = '''one\ntwo\nthree'''  # c")).toEqual(["s = '''", '', "'''"]);
  });

  it('empties an f-string with its {...} parts', () => {
    expect(blankStrings('print(f"Câu {i}: {answer!r}", end="")')).toEqual(['print(f"", end="")']);
    expect(blankStrings("print(f'{d[\"k\"]:>8}')")).toEqual(["print(f'')"]);
  });

  it('copes with escaped quotes and "#" inside strings, then drops the comment', () => {
    expect(blankStrings('s = "nói \\"#1\\" nhé"  # chú thích\n')).toEqual(['s = ""', '']);
    expect(blankStrings("t = 'it\\'s'  # note")).toEqual(["t = ''"]);
  });

  it('two files that differ only in strings and comments compare equal; code changes do not', () => {
    const vi = 'msg = "Xin chào"  # lời chào\nprint(msg, {"lang": "vi"})\n';
    const en = 'msg = "Hello"  # greeting\nprint(msg, {"lang": "en"})\n';
    expect(blankStrings(en)).toEqual(blankStrings(vi));
    // Control: another name, another call, one line more, or a string split in two are real differences.
    expect(blankStrings('message = "Hello"\nprint(message, {"lang": "en"})\n')).not.toEqual(blankStrings(vi));
    expect(blankStrings('msg = "Hello"\nprint(msg)\n')).not.toEqual(blankStrings(vi));
    expect(blankStrings('msg = "Hel"\n"lo"\nprint(msg, {"lang": "en"})\n')).not.toEqual(blankStrings(vi));
    expect(blankStrings('msg = "Hello" "!"\nprint(msg, {"lang": "en"})\n')).not.toEqual(blankStrings(vi));
  });

  it('scanPython gives the line of each string and comment', () => {
    const scan = scanPython('a = 1  # one\ns = """x\ny"""\nt = "z"\n');
    expect(scan.strings.map((str) => [str.line, str.content])).toEqual([
      [2, 'x\ny'],
      [4, 'z'],
    ]);
    expect(scan.comments.map((comment) => [comment.line, comment.alone])).toEqual([[1, false]]);
  });
});

describe('vietnameseOutsideData (translated .en.py)', () => {
  it('finds Vietnamese in comments, strings and code, NFD text included', () => {
    const source = '# Tạo dữ liệu\nprint("Kết quả")\nx = 1  # ok\nprint("ok")\ny = "Ke\u0302t"\n';
    expect(vietnameseOutsideData(source)).toEqual([
      { line: 1, where: 'comment' },
      { line: 2, where: 'string' },
      { line: 5, where: 'string' },
    ]);
  });

  it('flags đ and the other letters outside U+1EA0–U+1EF9', () => {
    for (const word of ['đi', 'Ăn', 'âm', 'Ê', 'ô', 'ơ', 'ư']) {
      expect(vietnameseOutsideData(`s = "${word}"`), word).toEqual([{ line: 1, where: 'string' }]);
    }
    // English with Latin-1 accents that are not Vietnamese-only.
    expect(vietnameseOutsideData('s = "café, naïve, Zürich"')).toEqual([]);
  });

  it('"# data: vi" on its own line exempts the strings of the next code line, across lines', () => {
    const source = [
      '# data: vi (the poem stays in Vietnamese)',
      '',
      'POEM = """Trăm năm trong cõi người ta,',
      'Chữ tài chữ mệnh khéo là ghét nhau."""',
      'cut = POEM.index("người")  # data: vi; a lookup key',
      'print("Số dòng")',
    ].join('\n');
    expect(vietnameseOutsideData(source)).toEqual([{ line: 6, where: 'string' }]);
  });

  it('a marker exempts only its strings: not the comment text, not the next lines', () => {
    expect(vietnameseOutsideData('x = "ổn"  # data: vi, còn dịch\n')).toEqual([{ line: 1, where: 'comment' }]);
    expect(vietnameseOutsideData('# data: vi\na = "một"\nb = "bốn"\n')).toEqual([{ line: 3, where: 'string' }]);
    // "data: video" or "metadata: vi" is not the marker.
    expect(vietnameseOutsideData('a = "một"  # data: video\n')).toEqual([{ line: 1, where: 'string' }]);
    expect(vietnameseOutsideData('a = "một"  # metadata: vi\n')).toEqual([{ line: 1, where: 'string' }]);
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
  const strict = viFiles.filter((file) => !file.startsWith(STRING_RULE_DIR));
  const llm = viFiles.filter((file) => file.startsWith(STRING_RULE_DIR));

  it.each(strict)('%s and its .en.py differ in comments only, line for line', (viFile) => {
    const enFile = viFile.replace(/\.vi\.py$/, '.en.py');
    const vi = stripComments(readFileSync(join(CODE_DIR, viFile), 'utf8'));
    const en = stripComments(readFileSync(join(CODE_DIR, enFile), 'utf8'));
    expect(en).toEqual(vi);
  });

  it.each(llm)('%s and its .en.py differ in comments and string text only, line for line', (viFile) => {
    const enFile = viFile.replace(/\.vi\.py$/, '.en.py');
    const vi = blankStrings(readFileSync(join(CODE_DIR, viFile), 'utf8'));
    const en = blankStrings(readFileSync(join(CODE_DIR, enFile), 'utf8'));
    expect(en).toEqual(vi);
  });
});

describe('translated lessons: no Vietnamese left in .en.py (llm-lessons.md 4.5)', () => {
  // Every part, not only llm/: a lesson with status.en 'published' and a folder src/code/<id>/.
  const translated = LESSONS.filter((lesson) => lesson.status.en === 'published')
    .map((lesson) => lesson.id)
    .filter((id) => existsSync(join(CODE_DIR, id)));
  const enFiles = translated.flatMap((id) =>
    readdirSync(join(CODE_DIR, id), { encoding: 'utf8' })
      .filter((file) => file.endsWith('.en.py'))
      .map((file) => `${id}/${file}`),
  );

  it('control: at least one translated lesson has code to check', () => {
    expect(enFiles.length).toBeGreaterThan(0);
  });

  it.each(enFiles)('%s has no Vietnamese outside "# data: vi" strings', (file) => {
    const hits = vietnameseOutsideData(readFileSync(join(CODE_DIR, file), 'utf8'));
    expect(hits.map((hit) => `${file}:${hit.line}: Vietnamese in a ${hit.where}`)).toEqual([]);
  });
});
