// Conventions of the code under src/code/llm/ (docs/architecture/llm-lessons.md, 2.3, 2.5, 2.6, 4.5 and 4.7).
// Every rule runs on every file, .vi.py and .en.py: code-pairs.test.ts blanks the strings of llm/ pairs, so it
// cannot see two files reading different variables or one file naming a model.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../../src/data/roadmap';
import { readEnvVars } from '../../../src/lib/local-code';
import { codeImports, localCodeTags } from '../fixtures/local-code-tags';
import { stripComments } from '../fixtures/python-source';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const LLM_DIR = join(ROOT, 'src', 'code', 'llm');
const MAX_LINES = 60;
const MAX_WIDTH = 79;
const LEVELS = ['cú pháp', 'chạy khô', 'chạy thật', 'đối chiếu'] as const;
const VERIFIED_HEADING = '## Kiểm chứng code';

// --- Rules on one file ---

const q = String.raw`\s*(['"])`;
const API_KEY = new RegExp(String.raw`\bapi_key\s*=\s*os\.environ\[${q}OPENAI_API_KEY\1\s*\]`);
const BASE_URL = new RegExp(String.raw`\bbase_url\s*=\s*os\.environ\.get\(${q}OPENAI_BASE_URL\1\s*\)`);
/** LLM_MODEL, or <CAPABILITY>_MODEL for another capability (IMAGE_MODEL, EMBEDDING_MODEL…; section 2.3). */
const MODEL_READ = new RegExp(String.raw`os\.environ\[${q}([A-Z][A-Z0-9]*_)*MODEL\1\s*\]`);
/** A model variable read with .get(...): it could carry a default model name (sections 2.3 and 2.6). */
const MODEL_GET = new RegExp(String.raw`os\.environ\.get\(${q}(?:[A-Z][A-Z0-9]*_)*MODEL\1`);
/** model="gpt-…", MODEL = '…', {"model": "…"}: a model name written in the code. */
const MODEL_LITERAL = /\b\w*model\s*=\s*[rRbBuUfF]{0,2}['"]|['"]model['"]\s*:\s*[rRbBuUfF]{0,2}['"]/i;
const IMPORTS_OPENAI = /^\s*(?:import\s+openai\b|from\s+openai\b)/m;

/** Every broken rule of one file (sections 4.5 rules 1–4), as readable lines. */
function fileProblems(source: string): string[] {
  const problems: string[] = [];
  const code = stripComments(source).join('\n');
  if (/\bOpenAI\(/.test(code)) {
    if (!API_KEY.test(code)) problems.push('OpenAI( without api_key=os.environ["OPENAI_API_KEY"]');
    if (!BASE_URL.test(code)) problems.push('OpenAI( without base_url=os.environ.get("OPENAI_BASE_URL")');
    if (!MODEL_READ.test(code)) problems.push('OpenAI( without os.environ["LLM_MODEL"] (or os.environ["<CAPABILITY>_MODEL"])');
  }
  if (MODEL_GET.test(code)) problems.push('a model variable read with os.environ.get: read it with os.environ["..."]');
  if (IMPORTS_OPENAI.test(code) && MODEL_LITERAL.test(code)) problems.push('a model name written in the code');
  // On the raw text: LocalCode reads the raw file, comments included, and fails on os.getenv anywhere.
  if (/\bos\.getenv\b/.test(source)) problems.push('os.getenv: use os.environ["X"] or os.environ.get("X")');
  if (/\bprint\(\s*os\.environ\b/.test(source)) problems.push('print(os.environ…');

  const lines = source.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n');
  if (lines.length > MAX_LINES) problems.push(`${lines.length} lines (at most ${MAX_LINES})`);
  lines.forEach((line, index) => {
    const width = [...line].length;
    if (width > MAX_WIDTH) problems.push(`line ${index + 1}: ${width} characters (at most ${MAX_WIDTH})`);
  });
  return problems;
}

describe('fileProblems (controls)', () => {
  const TEMPLATE = [
    'import os',
    'from openai import OpenAI',
    'client = OpenAI(',
    '    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI',
    "    api_key=os.environ['OPENAI_API_KEY'],",
    ')',
    'MODEL = os.environ[ "LLM_MODEL" ]',
    'r = client.chat.completions.create(model=MODEL, messages=[])',
    '',
  ].join('\n');

  it('accepts the template of section 2.3, single quotes and spaces included', () => {
    expect(fileProblems(TEMPLATE)).toEqual([]);
    expect(fileProblems(TEMPLATE.replace('"LLM_MODEL"', '"IMAGE_MODEL"'))).toEqual([]);
  });

  it('catches a client without the three variables', () => {
    expect(fileProblems(TEMPLATE.replace("api_key=os.environ['OPENAI_API_KEY']", 'api_key="dummy"'))).toEqual([
      'OpenAI( without api_key=os.environ["OPENAI_API_KEY"]',
    ]);
    expect(fileProblems(TEMPLATE.replace('base_url=os.environ.get("OPENAI_BASE_URL")', 'base_url=None'))).toHaveLength(1);
    expect(fileProblems(TEMPLATE.replace('os.environ[ "LLM_MODEL" ]', 'MODEL_NAME'))).toEqual([
      'OpenAI( without os.environ["LLM_MODEL"] (or os.environ["<CAPABILITY>_MODEL"])',
    ]);
    // A read only in a comment does not count.
    expect(fileProblems(TEMPLATE.replace('MODEL = os.environ[ "LLM_MODEL" ]', '# MODEL = os.environ["LLM_MODEL"]'))).toHaveLength(1);
  });

  it('catches a model name in the code, a model read with a default, os.getenv and print(os.environ', () => {
    expect(fileProblems(TEMPLATE.replace('model=MODEL', 'model="gpt-4o-mini"'))).toEqual(['a model name written in the code']);
    expect(fileProblems(`${TEMPLATE}MODEL = 'llama3'\n`)).toEqual(['a model name written in the code']);
    expect(fileProblems(`${TEMPLATE}body = {"model": "x"}\n`)).toEqual(['a model name written in the code']);
    expect(fileProblems(TEMPLATE.replace('os.environ[ "LLM_MODEL" ]', 'os.environ.get("LLM_MODEL", "gpt")'))).toContain(
      'a model variable read with os.environ.get: read it with os.environ["..."]',
    );
    expect(fileProblems(`${TEMPLATE}k = os.getenv("X")\n`)).toEqual(['os.getenv: use os.environ["X"] or os.environ.get("X")']);
    expect(fileProblems(`${TEMPLATE}# os.getenv("X")\n`)).toHaveLength(1);
    expect(fileProblems(`${TEMPLATE}print(os.environ)\n`)).toEqual(['print(os.environ…']);
    // Without openai, "model" is an ordinary word (a PyTorch model, a scikit-learn model).
    expect(fileProblems('model = "linear"\nprint(model)\n')).toEqual([]);
  });

  it('counts lines and characters, not bytes', () => {
    expect(fileProblems(`${'x = 1\n'.repeat(MAX_LINES)}`)).toEqual([]);
    expect(fileProblems(`${'x = 1\n'.repeat(MAX_LINES + 1)}`)).toEqual([`${MAX_LINES + 1} lines (at most ${MAX_LINES})`]);
    expect(fileProblems(`# ${'ư'.repeat(MAX_WIDTH - 2)}\n`)).toEqual([]);
    expect(fileProblems(`# ${'ư'.repeat(MAX_WIDTH - 1)}\n`)).toEqual([`line 1: ${MAX_WIDTH + 1} characters (at most ${MAX_WIDTH})`]);
  });
});

// --- The verification table of docs/research/<lesson>.md (section 4.7) ---

interface VerifiedRow {
  file: string;
  level: string;
  date: string;
}

/**
 * Rows of the first Markdown table after "## Kiểm chứng code" whose first cell holds only file names in backticks:
 * one name (section 4.7), or several separated by commas ("`chat.vi.py`, `chat.en.py`"), one row per name.
 */
function verifiedRows(markdown: string): VerifiedRow[] | undefined {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const heading = lines.findIndex((line) => line.trim() === VERIFIED_HEADING);
  if (heading === -1) return undefined;
  let start = heading + 1;
  while (start < lines.length && !lines[start]?.trim().startsWith('|')) {
    if (/^#{1,2}\s/.test(lines[start] ?? '')) return undefined; // next section, no table
    start++;
  }
  const rows: VerifiedRow[] = [];
  for (let i = start + 2; i < lines.length && lines[i]?.trim().startsWith('|'); i++) {
    const cells = (lines[i] ?? '')
      .trim()
      .replace(/^\||\|$/g, '')
      .split(/(?<!\\)\|/)
      .map((cell) => cell.trim());
    const first = cells[0] ?? '';
    if (!/^`[^`/\\]+`(?:\s*,\s*`[^`/\\]+`)*$/.test(first)) continue;
    for (const [, file = ''] of first.matchAll(/`([^`]+)`/g)) {
      rows.push({ file, level: cells[1] ?? '', date: cells[2] ?? '' });
    }
  }
  return rows;
}

describe('verifiedRows (controls)', () => {
  const md = [
    '# x',
    '## Kiểm chứng code',
    '',
    'Text.',
    '',
    '| File | Mức | Ngày | Môi trường | Kết quả |',
    '|---|---|---|---|---|',
    '| `chat.vi.py` | chạy thật | 2026-10-25 | a \\| b | ok |',
    '| khối `sh` trong bài | đối chiếu | 2026-10-25 | | |',
    '| `stream.vi.py` | chạy khô | 2026-10-24 | | |',
    '| `score.vi.py`, `.en.py` | chạy thật | 2026-10-24 | | |',
    '| Cả ba cặp, `x.vi.py` | cú pháp | 2026-10-24 | | |',
    '',
    '| `later.vi.py` | chạy thật | 2026-10-24 | | |',
  ].join('\n');

  it('reads the file rows of the first table only, escaped pipes included', () => {
    expect(verifiedRows(md)).toEqual([
      { file: 'chat.vi.py', level: 'chạy thật', date: '2026-10-25' },
      { file: 'stream.vi.py', level: 'chạy khô', date: '2026-10-24' },
      { file: 'score.vi.py', level: 'chạy thật', date: '2026-10-24' },
      { file: '.en.py', level: 'chạy thật', date: '2026-10-24' },
    ]);
  });

  it('gives undefined without the heading', () => {
    expect(verifiedRows('## Kiểm chứng\n\n| `a.vi.py` | chạy thật | 2026-10-24 |')).toBeUndefined();
  });
});

// --- The files ---

/** Paths relative to src/code/llm/, "/" separators. */
const files = existsSync(LLM_DIR)
  ? readdirSync(LLM_DIR, { recursive: true, encoding: 'utf8' })
      .map((file) => file.split('\\').join('/'))
      .filter((file) => file.endsWith('.py'))
  : [];
const read = (file: string) => readFileSync(join(LLM_DIR, file), 'utf8');

describe('src/code/llm/: every file follows the conventions (rules 1–4)', () => {
  it('control: there are files to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s', (file) => {
    expect(fileProblems(read(file)).map((problem) => `${file}: ${problem}`)).toEqual([]);
  });
});

describe('src/code/llm/: .vi.py and .en.py read the same environment variables (rule 5)', () => {
  const viFiles = files.filter((file) => file.endsWith('.vi.py'));
  it.each(viFiles)('%s', (viFile) => {
    const enFile = viFile.replace(/\.vi\.py$/, '.en.py');
    expect(readEnvVars(read(enFile))).toEqual(readEnvVars(read(viFile)));
  });
});

describe('published LLM lessons: every .vi.py has a row in the verification table (rule 6)', () => {
  const lessons = LESSONS.filter((lesson) => lesson.id.startsWith('llm/') && lesson.status.vi === 'published');

  it('control: some LLM lessons are published', () => {
    expect(lessons.length).toBeGreaterThan(0);
  });

  it.each(lessons.map((lesson) => lesson.id))('%s', (id) => {
    const slug = id.slice('llm/'.length);
    const codeDir = join(LLM_DIR, slug);
    const viFiles = existsSync(codeDir) ? readdirSync(codeDir).filter((file) => file.endsWith('.vi.py')) : [];
    if (viFiles.length === 0) return; // a lesson without code needs no table

    const research = join(ROOT, 'docs', 'research', `${slug}.md`);
    expect(existsSync(research), `docs/research/${slug}.md exists`).toBe(true);
    const rows = verifiedRows(readFileSync(research, 'utf8'));
    expect(rows, `docs/research/${slug}.md has a "${VERIFIED_HEADING}" heading with a table`).toBeDefined();

    // Files a LocalCode of the lesson shows with a sample output: they need a real run.
    const lessonSource = readFileSync(join(ROOT, 'src', 'content', 'docs', 'vi', `${id}.mdx`), 'utf8');
    const imports = codeImports(lessonSource);
    const withOutput = new Set(
      localCodeTags(lessonSource)
        .filter((tag) => tag.hasOutput && tag.code)
        .map((tag) => basename(imports.get(tag.code ?? '') ?? '')),
    );

    const problems: string[] = [];
    for (const file of viFiles) {
      const row = rows?.find((candidate) => candidate.file === file);
      if (!row) {
        problems.push(`${file}: no row in docs/research/${slug}.md`);
        continue;
      }
      if (!(LEVELS as readonly string[]).includes(row.level)) {
        problems.push(`${file}: level "${row.level}" is not one of ${LEVELS.join(', ')}`);
      } else if (withOutput.has(file) && row.level !== 'chạy thật') {
        problems.push(`${file}: shown with a sample output, so the level must be "chạy thật", not "${row.level}"`);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) problems.push(`${file}: date "${row.date}" is not YYYY-MM-DD`);
    }
    expect(problems).toEqual([]);
  });
});
