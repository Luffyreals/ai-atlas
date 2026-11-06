// Every Python program under src/code/, and every ```python block of an LLM or NLP lesson, parses as Python 3.10
// (docs/architecture/llm-lessons.md, 2.1, 2.5 and 4.5; nlp-lessons.md follows the LLM pattern): `openai` needs
// 3.10+, and the code is read on any machine. One Python process for all files: ast.parse(source, filename, feature_version=(3, 10)).
// feature_version is best effort (Python docs), so the script also refuses an f-string that reuses its own
// quote inside {...} (allowed only from 3.12, and the lexer of tests/unit/fixtures/python-source.ts relies on it).
// Interpreter: $PYTHON when set, else python3, else python. Without one the test fails and says how to fix it.
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

vi.setConfig({ testTimeout: 60_000 });
import { codeFences } from '../fixtures/mdx-fences';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const CODE_DIR = join(ROOT, 'src', 'code');
const DOCS_DIR = join(ROOT, 'src', 'content', 'docs');
const PYTHON_LANGS = new Set(['python', 'py', 'python3']);
const MIN_VERSION: [number, number] = [3, 10];

const SCRIPT = String.raw`
import ast, io, json, sys, tokenize

PREFIX = "rRbBuUfFtT"

def quote_of(text):
    body = text.lstrip(PREFIX)
    return body[:3] if body[:3] in ('"""', "'''") else body[:1]

def reused_quote(source):
    """Line of an f-string expression that reuses the f-string's own quote (Python 3.12+ only)."""
    if not hasattr(tokenize, "FSTRING_START"):
        return None
    stack = []
    try:
        for tok in tokenize.generate_tokens(io.StringIO(source).readline):
            if stack and tok.type in (tokenize.STRING, tokenize.FSTRING_START):
                outer = stack[-1]
                if len(outer) == 1 and quote_of(tok.string)[:1] == outer:
                    return tok.start[0]
            if tok.type == tokenize.FSTRING_START:
                stack.append(quote_of(tok.string))
            elif tok.type == tokenize.FSTRING_END and stack:
                stack.pop()
    except (tokenize.TokenError, SyntaxError):
        return None
    return None

items = json.loads(sys.stdin.buffer.read().decode("utf-8"))
errors = []
for item in items:
    try:
        ast.parse(item["source"], filename=item["name"], feature_version=(3, 10))
    except SyntaxError as error:
        errors.append({"name": item["name"], "line": error.lineno, "message": error.msg})
        continue
    line = reused_quote(item["source"])
    if line is not None:
        errors.append({"name": item["name"], "line": line,
                       "message": "f-string reuses its own quote inside {...}: Python 3.12+ only"})
sys.stdout.write(json.dumps({"version": list(sys.version_info[:3]), "errors": errors}))
`;

interface Item {
  /** Shown in errors, e.g. "src/code/llm/text-api/chat.vi.py". */
  name: string;
  source: string;
  /** Added to the error line: the file line just before the code (0 for a .py file). */
  offset: number;
}

interface Python {
  command?: string;
  version?: [number, number, number];
  /** Why no interpreter could be used. */
  problem?: string;
}

const HOW_TO_FIX =
  'Install Python 3.10 or newer (https://www.python.org/downloads/), or set the PYTHON environment variable ' +
  'to its path, e.g. PYTHON="C:/Python314/python.exe" npm test.';

function findPython(): Python {
  const fromEnv = process.env.PYTHON?.trim();
  const candidates = fromEnv ? [fromEnv] : ['python3', 'python'];
  const tried: string[] = [];
  for (const command of candidates) {
    const probe = spawnSync(command, ['-I', '-c', 'import sys; print("atlas-python", *sys.version_info[:3])'], {
      encoding: 'utf8',
      timeout: 30_000,
    });
    const match = /atlas-python (\d+) (\d+) (\d+)/.exec(probe.stdout ?? '');
    if (!match) {
      tried.push(`${command} (${probe.error ? probe.error.message : `exit ${probe.status}`})`);
      continue;
    }
    const version = [Number(match[1]), Number(match[2]), Number(match[3])] as [number, number, number];
    if (version[0] < MIN_VERSION[0] || (version[0] === MIN_VERSION[0] && version[1] < MIN_VERSION[1])) {
      tried.push(`${command} (Python ${version.join('.')}, too old)`);
      continue;
    }
    return { command, version };
  }
  const where = fromEnv ? `PYTHON=${fromEnv}` : 'python3 or python';
  return { problem: `No usable Python found (${where}). Tried: ${tried.join('; ')}. ${HOW_TO_FIX}` };
}

/** Runs the parse script on the items; returns "<name>:<line>: <message>" for each error. */
function parseAll(python: Python, items: Item[]): string[] {
  if (!python.command) throw new Error(python.problem);
  const result = spawnSync(python.command, ['-I', '-c', SCRIPT], {
    input: JSON.stringify(items.map(({ name, source }) => ({ name, source }))),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  });
  if (result.status !== 0) {
    throw new Error(`the parse script failed (exit ${result.status}): ${result.error?.message ?? result.stderr}`);
  }
  const { errors } = JSON.parse(result.stdout) as { errors: { name: string; line: number | null; message: string }[] };
  return errors.map((error) => {
    const offset = items.find((item) => item.name === error.name)?.offset ?? 0;
    return `${error.name}:${(error.line ?? 0) + offset}: ${error.message}`;
  });
}

const toPosix = (path: string) => relative(ROOT, path).split(sep).join('/');

function pythonFiles(): Item[] {
  return readdirSync(CODE_DIR, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.py'))
    .map((file) => join(CODE_DIR, file))
    .map((path) => ({ name: toPosix(path), source: readFileSync(path, 'utf8'), offset: 0 }));
}

/** ```python blocks of src/content/docs/<locale>/{llm,nlp}/**, without those inside MDX comments. */
function lessonBlocks(): Item[] {
  return readdirSync(DOCS_DIR, { recursive: true, encoding: 'utf8' })
    .map((file) => file.split('\\').join('/'))
    .filter((file) => /^[a-z]{2}\/(?:llm|nlp)\/.+\.mdx?$/.test(file))
    .flatMap((file) => {
      const path = join(DOCS_DIR, file);
      return codeFences(readFileSync(path, 'utf8'))
        .filter((fence) => PYTHON_LANGS.has(fence.lang))
        .map((fence) => ({ name: `${toPosix(path)} (block at line ${fence.line})`, source: fence.code, offset: fence.line - 1 }));
    });
}

const python = findPython();

describe('Python interpreter for the syntax check', () => {
  it(`is found, and is Python ${MIN_VERSION.join('.')} or newer`, () => {
    expect(python.problem, python.problem).toBeUndefined();
    expect(python.command).toBeTruthy();
  });
});

describe('the parse script (controls)', () => {
  const check = (source: string) => parseAll(python, [{ name: 'x.py', source, offset: 0 }]);

  it('accepts Python 3.10 code, match statement included', () => {
    expect(check('match x:\n    case 1:\n        pass\nprint(f"{x!r:>4}")\n')).toEqual([]);
  });

  it('reports a syntax error with its line', () => {
    expect(check('a = 1\nprint("x"\n')).toEqual([expect.stringMatching(/^x\.py:2: /)]);
  });

  it('refuses syntax newer than 3.10', () => {
    expect(check('type X = int\n')).toEqual([expect.stringMatching(/^x\.py:1: .*3\.12/)]);
    expect(check('try:\n    pass\nexcept* ValueError:\n    pass\n')).toEqual([expect.stringMatching(/3\.11/)]);
  });

  it('refuses an f-string that reuses its own quote, but not another quote or a triple-quoted f-string', () => {
    expect(check('d = {}\nprint(f"{d["a"]}")\n')).toEqual([expect.stringMatching(/^x\.py:2: f-string reuses/)]);
    expect(check(`d = {}\nprint(f"{d['a']}")\nprint(f"""{d["a"]}""")\n`)).toEqual([]);
  });

  it('adds the offset of a lesson block to the line', () => {
    expect(parseAll(python, [{ name: 'lesson.mdx', source: 'ok = 1\nbad(\n', offset: 40 }])).toEqual([
      expect.stringMatching(/^lesson\.mdx:42: /),
    ]);
  });
});

describe('every Python file under src/code/ and every ```python block of an LLM or NLP lesson parses as Python 3.10', () => {
  const files = pythonFiles();
  const blocks = lessonBlocks();

  it('control: there are LLM files and lesson blocks to check', () => {
    expect(files.filter((item) => item.name.startsWith('src/code/llm/')).length).toBeGreaterThan(0);
    expect(blocks.filter((item) => /\/llm\//.test(item.name)).length).toBeGreaterThan(0);
  });

  it('control: there are NLP files and lesson blocks to check', () => {
    expect(files.filter((item) => item.name.startsWith('src/code/nlp/')).length).toBeGreaterThan(0);
    expect(blocks.filter((item) => /\/nlp\//.test(item.name)).length).toBeGreaterThan(0);
  });

  it('has no syntax error', () => {
    expect(parseAll(python, [...files, ...blocks])).toEqual([]);
  });
});
