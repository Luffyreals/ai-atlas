// Turns a raw Pyodide traceback into what the runner shows: type, message, line, filtered traceback.
// Pure; tested against real Pyodide 314.0.7 tracebacks (tests/unit/fixtures/pyodide-tracebacks.ts).
import type { PythonErrorInfo } from './protocol';

const HEADER = 'Traceback (most recent call last):';
// User code runs under the file name "<exec>" (Pyodide's default), so its frames carry no source line.
const EXEC_FRAME = /^\s*File "<exec>", line (\d+)/;
const FRAME = /^\s*File "/;
const PYODIDE_FRAME = /^\s*File ".*\/_pyodide\//;

export function parsePythonError(traceback: string, type?: string): PythonErrorInfo {
  const lines = traceback.replace(/\r\n?/g, '\n').trimEnd().split('\n');

  let line: number | undefined;
  for (const text of lines) {
    const match = EXEC_FRAME.exec(text);
    if (match) line = Number(match[1]); // the last (deepest) user frame wins
  }

  const { errorType, message } = readErrorLine(lines, type);
  return { type: errorType, message, line, traceback: filterTraceback(lines) };
}

/** Header + frames from the first "<exec>" frame on; Pyodide's internal frames are dropped. */
function filterTraceback(lines: string[]): string {
  const firstExec = lines.findIndex((text) => EXEC_FRAME.test(text));
  const body = firstExec === -1 ? lines.filter((text) => text !== HEADER) : lines.slice(firstExec);

  const kept: string[] = [];
  let skipping = false;
  for (const text of body) {
    if (FRAME.test(text)) skipping = PYODIDE_FRAME.test(text);
    else if (!text.startsWith('    ')) skipping = false; // a frame's source lines are indented 4+
    if (!skipping) kept.push(text);
  }
  return [HEADER, ...kept].join('\n');
}

/** Finds the "Type: message" line, searching from the end. Qualified names (numpy.linalg.X) match too. */
function readErrorLine(lines: string[], type?: string): { errorType: string; message: string } {
  const name = type ? escapeRegExp(type) : '[A-Za-z_]\\w*';
  const pattern = new RegExp(`^(?:[A-Za-z_][\\w.]*\\.)?(${name})(?::\\s?(.*))?$`);
  for (let i = lines.length - 1; i >= 0; i--) {
    const match = pattern.exec(lines[i]);
    if (!match) continue;
    // Lines after it (e.g. exception notes) belong to the message.
    const rest = lines.slice(i + 1);
    const message = [match[2] ?? '', ...rest].join('\n').trim();
    return { errorType: type ?? match[1], message };
  }
  return { errorType: type ?? 'Error', message: lines.at(-1)?.trim() ?? '' };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type HintKey =
  | 'hintNameError'
  | 'hintSyntaxError'
  | 'hintIndentationError'
  | 'hintTypeError'
  | 'hintValueError'
  | 'hintIndexError'
  | 'hintKeyError'
  | 'hintAttributeError'
  | 'hintZeroDivisionError'
  | 'hintModuleNotFoundError'
  | 'hintEOFError'
  | 'hintGeneric';

const HINT_KEYS: ReadonlySet<string> = new Set<HintKey>([
  'hintNameError',
  'hintSyntaxError',
  'hintIndentationError',
  'hintTypeError',
  'hintValueError',
  'hintIndexError',
  'hintKeyError',
  'hintAttributeError',
  'hintZeroDivisionError',
  'hintModuleNotFoundError',
  'hintEOFError',
  'hintGeneric',
]);

const HINT_ALIASES = new Map([
  ['TabError', 'IndentationError'],
  ['ImportError', 'ModuleNotFoundError'],
]);

/** TabError -> IndentationError hint; ImportError -> ModuleNotFoundError hint; unknown -> hintGeneric.
 *  EOFError with no `stdin` prop: the island shows runner.stdinMissing instead of hintEOFError. */
export function hintKeyFor(type: string): HintKey {
  const key = `hint${HINT_ALIASES.get(type) ?? type}`;
  return isHintKey(key) ? key : 'hintGeneric';
}

function isHintKey(key: string): key is HintKey {
  return HINT_KEYS.has(key);
}
