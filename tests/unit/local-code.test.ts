// Requirement lines of LocalCode: readEnvVars and pipCommand (docs/architecture/llm-lessons.md, 4.1 and 4.5).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { pipCommand, readEnvVars } from '../../src/lib/local-code';
import { codeImports, localCodeTags } from './fixtures/local-code-tags';

// The API call template of llm-lessons.md section 2.3.
const TEMPLATE = `# Gọi một mô hình chat qua API kiểu OpenAI (OpenAI-compatible).
import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]

response = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": "Bạn trả lời ngắn gọn bằng tiếng Việt."},
        {"role": "user", "content": "RAG là gì? Trả lời trong hai câu."},
    ],
)
print(response.choices[0].message.content)
`;

describe('readEnvVars', () => {
  it('reads the template of section 2.3 in order of first appearance', () => {
    expect(readEnvVars(TEMPLATE)).toEqual([
      { name: 'OPENAI_BASE_URL', optional: true },
      { name: 'OPENAI_API_KEY', optional: false },
      { name: 'LLM_MODEL', optional: false },
    ]);
  });

  it('reads the demo file src/code/dev/local-chat.vi.py the same way', () => {
    const code = readFileSync(fileURLToPath(new URL('../../src/code/dev/local-chat.vi.py', import.meta.url)), 'utf8');
    expect(readEnvVars(code).map((v) => `${v.name}${v.optional ? '?' : ''}`)).toEqual([
      'OPENAI_BASE_URL?',
      'OPENAI_API_KEY',
      'LLM_MODEL',
    ]);
  });

  it('a name read both with [...] and with .get(...) is required, whichever comes first', () => {
    const getFirst = 'a = os.environ.get("X")\nb = os.environ["X"]\n';
    const indexFirst = 'b = os.environ["X"]\na = os.environ.get("X")\n';
    expect(readEnvVars(getFirst)).toEqual([{ name: 'X', optional: false }]);
    expect(readEnvVars(indexFirst)).toEqual([{ name: 'X', optional: false }]);
  });

  it('lists each name once', () => {
    expect(readEnvVars('os.environ["A"]\nos.environ["B"]\nos.environ["A"]\nos.environ.get("B")\n')).toEqual([
      { name: 'A', optional: false },
      { name: 'B', optional: false },
    ]);
  });

  it('accepts single and double quotes, and spaces inside the brackets', () => {
    expect(readEnvVars(`k = os.environ[ 'KEY_A' ]\nu = os.environ .get( "URL_B" , "x")\nm = os.environ['M']`)).toEqual([
      { name: 'KEY_A', optional: false },
      { name: 'URL_B', optional: true },
      { name: 'M', optional: false },
    ]);
  });

  it('.get with a default is still optional', () => {
    expect(readEnvVars('os.environ.get("PORT", "8000")')).toEqual([{ name: 'PORT', optional: true }]);
  });

  it('ignores mismatched quotes and names that are not identifiers', () => {
    expect(readEnvVars(`os.environ["A']\nos.environ["1X"]\nos.environ[name]`)).toEqual([]);
  });

  it('throws on os.getenv, wherever it is (LocalCode would miss the variable)', () => {
    expect(() => readEnvVars('import os\nkey = os.getenv("OPENAI_API_KEY")\n')).toThrow(/os\.getenv/);
    expect(() => readEnvVars('url = os.getenv ("URL", "x")')).toThrow(/os\.getenv/);
    // The message tells how to read a variable instead.
    expect(() => readEnvVars('os.getenv("A")')).toThrow(/os\.environ\["X"\]/);
  });

  it('throws on getenv or environ imported from os (the bare names would be missed too)', () => {
    expect(() => readEnvVars('from os import getenv\nkey = getenv("OPENAI_API_KEY")\n')).toThrow(/getenv/);
    expect(() => readEnvVars('from os import environ\nkey = environ["OPENAI_API_KEY"]\n')).toThrow(/environ/);
    expect(() => readEnvVars('from os import path, environ as env\n')).toThrow(/environ/);
    expect(readEnvVars('from os import path\nimport os\nos.environ["A"]\n')).toEqual([{ name: 'A', optional: false }]);
  });

  it('gives [] for code that reads no variable', () => {
    expect(readEnvVars('import numpy as np\nprint(np.arange(3))\n')).toEqual([]);
    expect(readEnvVars('')).toEqual([]);
  });

  it('does not take os.environ as a whole, or another mapping, for a variable', () => {
    expect(readEnvVars('print(dict(os.environ))\nenv = {}\nenv["X"] = 1\nmy.environ["Y"]')).toEqual([]);
  });
});

describe('pipCommand', () => {
  it('joins plain names, unquoted', () => {
    expect(pipCommand(['openai'])).toBe('pip install openai');
    expect(pipCommand(['openai', 'numpy', 'scikit-learn', 'zope.interface', 'typing_extensions'])).toBe(
      'pip install openai numpy scikit-learn zope.interface typing_extensions',
    );
  });

  it('gives "" for an empty list', () => {
    expect(pipCommand([])).toBe('');
  });

  it('wraps a name with shell characters in single quotes', () => {
    expect(pipCommand(['openai', 'gradio>=6'])).toBe("pip install openai 'gradio>=6'");
    expect(pipCommand(['langchain==1.2.3'])).toBe("pip install 'langchain==1.2.3'");
    expect(pipCommand(['uvicorn[standard]'])).toBe("pip install 'uvicorn[standard]'");
    expect(pipCommand(['a;b'])).toBe("pip install 'a;b'");
    expect(pipCommand(['numpy<3,>=2'])).toBe("pip install 'numpy<3,>=2'");
    expect(pipCommand(['torch >=2'])).toBe("pip install 'torch >=2'");
    expect(pipCommand(['pkg~=1.0', 'x!=2'])).toBe("pip install 'pkg~=1.0' 'x!=2'");
  });

  it('throws on an empty or blank name', () => {
    expect(() => pipCommand([''])).toThrow(/invalid pip package name/);
    expect(() => pipCommand(['openai', '   '])).toThrow(/invalid pip package name/);
  });

  it("throws on a single quote, a tab or a line break, which bash and PowerShell escape differently", () => {
    for (const name of ["it's", 'a\tb', 'a\nb', 'a\r\nb', 'a\rb']) {
      expect(() => pipCommand([name]), JSON.stringify(name)).toThrow(/invalid pip package name/);
    }
  });

  it('names the bad value in the error', () => {
    expect(() => pipCommand(['openai', "x'y"])).toThrow(`"x'y"`);
  });
});

describe('localCodeTags (fixture used by llm-code.test.ts and the e2e specs)', () => {
  const mdx = [
    '---',
    'title: "<LocalCode /> in the frontmatter is not a tag"',
    '---',
    "import chatCode from '@code/llm/text-api/chat.vi.py?raw';",
    "import appCode from '@code/llm/x/app.vi.py?raw';",
    '',
    "<LocalCode code={chatCode} title=\"Hội thoại\" packages={['openai', 'gradio>=6']} />",
    '',
    '{/* <LocalCode code={appCode} /> */}',
    '',
    '```mdx',
    '<LocalCode code={inAFence} />',
    '```',
    '',
    '<LocalCode',
    '  code={appCode}',
    "  file='app.py'",
    '  command="streamlit run app.py"',
    '  sampleVaries={false}',
    '>',
    '',
    '```text',
    'Hello',
    '```',
    '',
    '</LocalCode>',
    '',
    '<LocalCode code={chatCode}>',
    '{/* no output yet */}',
    '</LocalCode>',
  ].join('\n');

  it('reads the props, the output slot, and skips comments, fences and the frontmatter', () => {
    const tags = localCodeTags(mdx);
    expect(tags.map(({ line, code, packages, title, file, command, sampleVaries, hasOutput }) => ({
      line, code, packages, title, file, command, sampleVaries, hasOutput,
    }))).toEqual([
      { line: 7, code: 'chatCode', packages: ['openai', 'gradio>=6'], title: 'Hội thoại', file: undefined, command: undefined, sampleVaries: true, hasOutput: false },
      { line: 15, code: 'appCode', packages: [], title: undefined, file: 'app.py', command: 'streamlit run app.py', sampleVaries: false, hasOutput: true },
      { line: 28, code: 'chatCode', packages: [], title: undefined, file: undefined, command: undefined, sampleVaries: true, hasOutput: false },
    ]);
    expect([...codeImports(mdx)]).toEqual([
      ['chatCode', 'llm/text-api/chat.vi.py'],
      ['appCode', 'llm/x/app.vi.py'],
    ]);
  });
});
