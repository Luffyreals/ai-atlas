// The <LocalCode> tags of an MDX file and the code files they show (docs/architecture/llm-lessons.md, 4.1 and
// 4.5). Used by llm-code.test.ts (a file with a sample output must be verified by a real run) and by the e2e
// specs (components.spec.ts, lessons-meta.spec.ts), which compare the page with the props written here.
// Not a JSX parser: enough for the props LocalCode takes (strings, {identifier}, {[...strings]}, {true|false}).

export interface LocalCodeTag {
  /** 1-based line of "<LocalCode". */
  line: number;
  /** Raw props: string props without quotes, expression props as written between the braces. */
  props: Record<string, string>;
  /** The identifier of `code={...}`, e.g. 'chatCode'. */
  code?: string;
  /** `packages={[...]}` as strings; [] when absent. */
  packages: string[];
  title?: string;
  file?: string;
  command?: string;
  hardware?: string;
  /** `sampleVaries`, default true. */
  sampleVaries: boolean;
  /** The tag has content (the sample output slot), not only spaces or MDX comments. */
  hasOutput: boolean;
}

const FRONTMATTER = /^(?:﻿?|\s*\n)---[\s\S]*?\n---/;

/** Blank (keep line breaks) the frontmatter, MDX comments and the inside of code fences; fence lines stay. */
function prepare(source: string): string {
  let text = source.replace(/\r\n?/g, '\n');
  text = text.replace(FRONTMATTER, (block) => block.replace(/[^\n]/g, ' '));
  const lines = text.split('\n');
  let fence = '';
  const out = lines.map((line) => {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length && line.trim() === marker) {
        fence = '';
        return line;
      }
      return '';
    }
    if (marker) fence = marker;
    return line;
  });
  return out.join('\n').replace(/\{\/\*[\s\S]*?\*\/\}/g, (comment) => comment.replace(/[^\n]/g, ' '));
}

/** Reads one prop value at `i` (just after "="): "...", '...' or {...} with nested braces and strings. */
function readValue(text: string, i: number): { value: string; end: number; expression: boolean } {
  const open = text[i];
  if (open === '"' || open === "'") {
    const end = text.indexOf(open, i + 1);
    return { value: text.slice(i + 1, end), end: end + 1, expression: false };
  }
  if (open !== '{') throw new Error(`unexpected prop value at ${text.slice(i, i + 20)}`);
  let depth = 0;
  let quote = '';
  for (let j = i; j < text.length; j++) {
    const c = text[j];
    if (quote) {
      if (c === '\\') j++;
      else if (c === quote) quote = '';
    } else if (c === '"' || c === "'" || c === '`') {
      quote = c;
    } else if (c === '{') {
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) return { value: text.slice(i + 1, j).trim(), end: j + 1, expression: true };
    }
  }
  throw new Error('unclosed { in a prop');
}

const strings = (expression: string) => [...expression.matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g)].map((m) => m[2] ?? '');

export function localCodeTags(source: string): LocalCodeTag[] {
  const text = prepare(source);
  const tags: LocalCodeTag[] = [];
  const open = /<LocalCode(?=[\s/>])/g;
  for (let match = open.exec(text); match; match = open.exec(text)) {
    const line = text.slice(0, match.index).split('\n').length;
    const props: Record<string, string> = {};
    let i = match.index + match[0].length;
    let selfClosing = false;
    for (;;) {
      while (/\s/.test(text[i] ?? '')) i++;
      if (text.startsWith('/>', i)) {
        selfClosing = true;
        i += 2;
        break;
      }
      if (text[i] === '>') {
        i++;
        break;
      }
      const name = /^[A-Za-z_][\w-]*/.exec(text.slice(i))?.[0];
      if (!name) throw new Error(`cannot read the props of <LocalCode> at line ${line}`);
      i += name.length;
      if (text[i] === '=') {
        const { value, end } = readValue(text, i + 1);
        props[name] = value;
        i = end;
      } else {
        props[name] = 'true';
      }
    }
    let hasOutput = false;
    if (!selfClosing) {
      const close = text.indexOf('</LocalCode>', i);
      if (close === -1) throw new Error(`<LocalCode> at line ${line} is not closed`);
      hasOutput = text.slice(i, close).trim() !== '';
      open.lastIndex = close;
    }
    tags.push({
      line,
      props,
      code: props.code,
      packages: props.packages ? strings(props.packages) : [],
      title: props.title,
      file: props.file,
      command: props.command,
      hardware: props.hardware,
      sampleVaries: props.sampleVaries !== 'false',
      hasOutput,
    });
  }
  return tags;
}

/** `import name from '@code/…?raw'` of the file: identifier -> path under src/code/, e.g. 'llm/text-api/chat.vi.py'. */
export function codeImports(source: string): Map<string, string> {
  const text = prepare(source);
  const imports = new Map<string, string>();
  for (const match of text.matchAll(/^import\s+([\w$]+)\s+from\s+(['"])@code\/([^'"?]+)(?:\?raw)?\2/gm)) {
    imports.set(match[1] ?? '', match[3] ?? '');
  }
  return imports;
}
