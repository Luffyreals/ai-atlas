// No API key, token or password written into the repository (docs/architecture/llm-lessons.md, 2.3 and 4.5):
// not in the lesson code, not in a code block of a lesson, not in a sample output, not in docs/.
// The fixtures below build their fake keys at run time ('sk-' + 'x'.repeat(30)), so this file holds nothing that
// looks like a key (GitHub secret scanning included). A finding is reported as "<file>:<line>: <kind>", never with
// the value.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { codeFences } from '../fixtures/mdx-fences';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const SCANNED_DIRS = ['src', 'docs', 'scripts'];
const EXTENSIONS = /\.(py|md|mdx|ts|tsx|astro|json|txt)$/;

// --- Rules ---

/** Known key formats: the prefix, then at least N characters (section 4.5). */
const KEY_PATTERNS: [kind: string, pattern: RegExp][] = [
  ['OpenAI/Anthropic key (sk-)', /(?<![\w-])sk-[A-Za-z0-9_-]{16,}/],
  ['Google API key (AIza)', /(?<![\w-])AIza[A-Za-z0-9_-]{30,}/],
  ['Groq key (gsk_)', /(?<![\w-])gsk_[A-Za-z0-9_-]{20,}/],
  ['Hugging Face token (hf_)', /(?<![\w-])hf_[A-Za-z0-9_-]{20,}/],
  ['xAI key (xai-)', /(?<![\w-])xai-[A-Za-z0-9_-]{20,}/],
  ['Replicate token (r8_)', /(?<![\w-])r8_[A-Za-z0-9_-]{20,}/],
  ['GitHub token (ghp_, github_pat_)', /(?<![\w-])(?:ghp_|github_pat_)[A-Za-z0-9_-]{20,}/],
  ['AWS access key (AKIA)', /(?<![\w-])AKIA[A-Z0-9]{16}/],
];

/**
 * A MongoDB connection string with a user name and a password before "@". Placeholders in angle brackets
 * ("mongodb+srv://<user>:<password>@…", the form of section 2.3) are not credentials.
 */
const MONGO_CREDENTIALS = /mongodb(?:\+srv)?:\/\/([^\s:/@'"`]+):([^\s@'"`]+)@/g;
const PLACEHOLDER = /^<[^<>]+>$/;

/** api_key, apikey, token, secret, password (inside a longer name too), then = or :, then a quoted value. */
const HARD_CODED =
  /(?:api_?key|token|secret|password)\w*['"]?\s*[=:]\s*(['"])([^'"<>{}\s]{12,})\1/gi;

/** Shell code blocks whose `export X=` / `$env:X =` lines are checked. */
const SHELL_LANGS = new Set(['sh', 'bash', 'shell', 'zsh', 'console', 'powershell', 'ps1', 'pwsh', 'ps']);
const SHELL_SET = /^\s*(?:export\s+([A-Za-z_]\w*)\s*=|\$env:([A-Za-z_]\w*)\s*=)\s*(.*?)\s*$/;
/** A placeholder "<...>" (quoted or not), or one lower-case word of at most 12 letters such as ollama. */
const SAFE_SHELL_VALUE = /^(?:(["'])<[^<>]+>\1|<[^<>]+>|(["']?)[a-z]{1,12}\2)$/;

interface Finding {
  line: number;
  kind: string;
}

/** Findings in one file's text; `markdown` also checks its shell code blocks. */
function scanText(text: string, markdown: boolean): Finding[] {
  const findings: Finding[] = [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  lines.forEach((row, index) => {
    const line = index + 1;
    for (const [kind, pattern] of KEY_PATTERNS) if (pattern.test(row)) findings.push({ line, kind });
    for (const match of row.matchAll(MONGO_CREDENTIALS)) {
      const [, user = '', password = ''] = match;
      if (!PLACEHOLDER.test(user) && !PLACEHOLDER.test(password)) {
        findings.push({ line, kind: 'MongoDB connection string with a user and password' });
      }
    }
    if ([...row.matchAll(HARD_CODED)].length > 0) {
      findings.push({ line, kind: 'hard-coded value for a key, token, secret or password' });
    }
  });
  if (markdown) {
    for (const fence of codeFences(text)) {
      if (!SHELL_LANGS.has(fence.lang)) continue;
      fence.code.split('\n').forEach((row, index) => {
        const match = SHELL_SET.exec(row);
        const name = match?.[1] ?? match?.[2];
        if (!match || !name || !name.toUpperCase().includes('KEY')) return;
        // Without a trailing shell comment ("   # Ollama accepts any string").
        const value = (match[3] ?? '').replace(/\s+#.*$/, '');
        if (!SAFE_SHELL_VALUE.test(value)) {
          findings.push({ line: fence.line + index, kind: `${name} set to a value in a shell block (use "<...>")` });
        }
      });
    }
  }
  return findings;
}

function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((file) => join(dir, file))
    .filter((file) => EXTENSIONS.test(file) && statSync(file).isFile());
}

// --- Fixtures, built at run time ---

const fake = {
  openai: 'sk-' + 'proj-' + 'a1B2'.repeat(6),
  anthropic: 'sk-' + 'ant-' + 'x'.repeat(30),
  google: 'AI' + 'za' + 'S'.repeat(33),
  groq: 'gs' + 'k_' + 'q'.repeat(24),
  hf: 'h' + 'f_' + 'Z'.repeat(24),
  xai: 'xa' + 'i-' + 'y'.repeat(24),
  replicate: 'r' + '8_' + 'r'.repeat(24),
  github: 'gh' + 'p_' + 'g'.repeat(36),
  githubPat: 'github' + '_pat_' + 'h'.repeat(30),
  aws: 'AK' + 'IA' + 'Q'.repeat(16),
};

describe('scanText', () => {
  it.each(Object.entries(fake))('finds a %s key in Python, in a string and in a comment', (_, key) => {
    expect(scanText(`import os\nclient = OpenAI(api_key="${key}")\n`, false).map((f) => f.line)).toContain(2);
    expect(scanText(`# key: ${key}\n`, false)).not.toEqual([]);
  });

  it('reports the line and the kind, never the value', () => {
    const findings = scanText(`a = 1\nb = 2\nkey = "${fake.groq}"\n`, false);
    expect(findings.map((f) => f.line)).toEqual([3]);
    expect(JSON.stringify(findings)).not.toContain(fake.groq);
  });

  it('finds a hard-coded api_key, token, secret or password, whatever the case and the separator', () => {
    const value = 'abc' + 'Def123456789';
    for (const row of [
      `api_key = "${value}"`,
      `OPENAI_API_KEY='${value}'`,
      `apikey: "${value}"`,
      `"token": "${value}"`,
      `client_secret="${value}"`,
      `PASSWORD = '${value}'`,
    ]) {
      expect(scanText(row, false), row).toEqual([{ line: 1, kind: 'hard-coded value for a key, token, secret or password' }]);
    }
  });

  it('leaves alone environment reads, placeholders, short values and token counts', () => {
    for (const row of [
      'api_key=os.environ["OPENAI_API_KEY"],',
      'api_key="dummy"',
      'api_key="<key-của-bạn>"',
      'password = "{password}"',
      'max_tokens=300',
      'print(response.usage.total_tokens)',
      'token: string;',
      'export OPENAI_API_KEY="<key-của-bạn>"',
      'mongodb+srv://<user>:<password>@cluster0.example.net',
      'mongodb://127.0.0.1:27017',
      'task-sk-force', // "sk-" inside a word
      'risk-adjusted-return-of-the-portfolio',
    ]) {
      expect(scanText(row, false), row).toEqual([]);
    }
  });

  it('finds a MongoDB connection string with a real user and password', () => {
    const uri = 'mongodb+srv://' + 'atlas' + ':' + 'hunter' + '2@cluster0.example.net/db';
    expect(scanText(`client = MongoClient("${uri}")`, false)).toEqual([
      { line: 1, kind: 'MongoDB connection string with a user and password' },
    ]);
    expect(scanText('mongodb://' + 'u' + ':' + 'p@localhost', false)).toHaveLength(1);
  });

  it('checks KEY variables in shell blocks of Markdown: placeholder or one short lower-case word only', () => {
    const md = (lang: string, body: string) => `Text\n\n\`\`\`${lang}\n${body}\n\`\`\`\n`;
    expect(scanText(md('sh', 'export OPENAI_API_KEY="<key-của-bạn>"\nexport LLM_MODEL="<tên model>"'), true)).toEqual([]);
    expect(scanText(md('sh', 'export OPENAI_API_KEY=ollama'), true)).toEqual([]);
    expect(scanText(md('powershell', '$env:OPENAI_API_KEY = "<key>"'), true)).toEqual([]);
    expect(scanText(md('powershell', '$env:OPENAI_API_KEY = "ollama"'), true)).toEqual([]);
    expect(scanText(md('sh', 'export OPENAI_API_KEY="ollama"   # any string works'), true)).toEqual([]);

    const value = 'Abc' + '123def';
    expect(scanText(md('bash', `export OPENAI_API_KEY="${value}"`), true)).toEqual([
      { line: 4, kind: 'OPENAI_API_KEY set to a value in a shell block (use "<...>")' },
    ]);
    expect(scanText(md('powershell', `$env:GROQ_API_KEY = ${value}`), true)).toHaveLength(1);
    expect(scanText(md('sh', `export OPENAI_API_KEY="${value}"  # mine`), true)).toHaveLength(1);
    expect(scanText(md('sh', 'export OPENAI_API_KEY=averyveryverylongword'), true)).toHaveLength(1);
    // Only names with KEY; and a shell block inside an MDX comment is not on the page.
    expect(scanText(md('sh', `export LLM_MODEL=${value}`), true)).toEqual([]);
    expect(scanText(`{/*\n${md('sh', `export OPENAI_API_KEY=${value}`)}*/}\n`, true)).toEqual([]);
    // Python blocks are not shell blocks.
    expect(scanText(md('python', `export_KEY = 1`), true)).toEqual([]);
  });
});

describe('no secret in src/, docs/ or scripts/', () => {
  const files = SCANNED_DIRS.flatMap((dir) => listFiles(join(ROOT, dir)));

  it('scans the lesson code, the lessons and the docs (control)', () => {
    const names = files.map((file) => relative(ROOT, file).split(sep).join('/'));
    expect(names.filter((name) => name.startsWith('src/code/llm/') && name.endsWith('.py')).length).toBeGreaterThan(0);
    expect(names.filter((name) => name.startsWith('src/content/docs/') && name.endsWith('.mdx')).length).toBeGreaterThan(0);
    expect(names).toContain('docs/architecture/llm-lessons.md');
  });

  it('finds no key, token, password or KEY variable with a value', () => {
    const findings = files.flatMap((file) => {
      const name = relative(ROOT, file).split(sep).join('/');
      return scanText(readFileSync(file, 'utf8'), /\.mdx?$/.test(file)).map((f) => `${name}:${f.line}: ${f.kind}`);
    });
    expect(findings).toEqual([]);
  });
});
