import { describe, expect, it } from 'vitest';
import { UI_KEYS } from '../../src/i18n/ui';
import { hintKeyFor, parsePythonError } from '../../src/lib/pyodide/errors';
import { TRACEBACKS } from './fixtures/pyodide-tracebacks';

describe('parsePythonError', () => {
  for (const [name, fixture] of Object.entries(TRACEBACKS)) {
    describe(name, () => {
      const info = parsePythonError(fixture.traceback, fixture.type);

      it('reads the type, message and line', () => {
        expect(info.type).toBe(fixture.type);
        expect(info.message).toBe(fixture.expected.message);
        expect(info.line).toBe(fixture.expected.line);
      });

      it('points at a line that exists in the code', () => {
        expect(fixture.code.split('\n').length).toBeGreaterThanOrEqual(fixture.expected.line);
      });

      it('drops every Pyodide frame and keeps the header and the user frames', () => {
        expect(info.traceback).not.toContain('_pyodide');
        expect(info.traceback).not.toContain('CodeRunner');
        expect(info.traceback.startsWith('Traceback (most recent call last):\n  File "<exec>"')).toBe(true);
        expect(info.traceback.endsWith(`${fixture.type}: ${fixture.expected.message}`)).toBe(true);
      });
    });
  }

  it('uses the deepest "<exec>" frame for an error inside a function', () => {
    const info = parsePythonError(TRACEBACKS.ZeroDivisionError.traceback, 'ZeroDivisionError');
    expect(info.line).toBe(2);
    expect(info.traceback).toBe(
      'Traceback (most recent call last):\n' +
        '  File "<exec>", line 4, in <module>\n' +
        '  File "<exec>", line 2, in f\n' +
        'ZeroDivisionError: division by zero',
    );
  });

  it('keeps the source lines and caret of a SyntaxError frame', () => {
    const info = parsePythonError(TRACEBACKS.SyntaxError.traceback, 'SyntaxError');
    expect(info.traceback).toContain('  File "<exec>", line 2\n    if a > 0\n            ^\n');
  });

  it('reads the type from the last line when it is not given', () => {
    const info = parsePythonError(TRACEBACKS.NameError.traceback);
    expect(info.type).toBe('NameError');
    expect(info.message).toBe("name 'y' is not defined");
  });

  it('keeps library frames after the user frame and accepts qualified error names', () => {
    const traceback = [
      'Traceback (most recent call last):',
      '  File "/lib/python314.zip/_pyodide/_base.py", line 420, in run_async',
      '    coroutine = eval(self.code, globals, locals)',
      '  File "<exec>", line 3, in <module>',
      '  File "/lib/python3.14/site-packages/numpy/linalg/_linalg.py", line 104, in _raise_linalgerror_singular',
      '    raise LinAlgError("Singular matrix")',
      'numpy.linalg.LinAlgError: Singular matrix',
    ].join('\n');
    const info = parsePythonError(traceback, 'LinAlgError');
    expect(info).toMatchObject({ type: 'LinAlgError', message: 'Singular matrix', line: 3 });
    expect(info.traceback).toContain('site-packages/numpy/linalg');
    expect(info.traceback).not.toContain('_pyodide');
  });

  it('handles an error without a message or a user frame', () => {
    const info = parsePythonError('Traceback (most recent call last):\nKeyboardInterrupt\n', 'KeyboardInterrupt');
    expect(info).toEqual({
      type: 'KeyboardInterrupt',
      message: '',
      line: undefined,
      traceback: 'Traceback (most recent call last):\nKeyboardInterrupt',
    });
  });

  it('does not throw on an empty traceback', () => {
    expect(parsePythonError('', 'RuntimeError')).toMatchObject({ type: 'RuntimeError', line: undefined });
  });
});

describe('hintKeyFor', () => {
  it('maps known error types to their hint', () => {
    expect(hintKeyFor('NameError')).toBe('hintNameError');
    expect(hintKeyFor('ZeroDivisionError')).toBe('hintZeroDivisionError');
    expect(hintKeyFor('EOFError')).toBe('hintEOFError');
  });

  it('maps TabError and ImportError to their parent hints', () => {
    expect(hintKeyFor('TabError')).toBe('hintIndentationError');
    expect(hintKeyFor('ImportError')).toBe('hintModuleNotFoundError');
  });

  it('falls back to the generic hint', () => {
    expect(hintKeyFor('RecursionError')).toBe('hintGeneric');
    expect(hintKeyFor('constructor')).toBe('hintGeneric');
    expect(hintKeyFor('')).toBe('hintGeneric');
  });

  it('only returns keys that exist in the runner strings', () => {
    const types = ['NameError', 'SyntaxError', 'IndentationError', 'TypeError', 'ValueError', 'IndexError',
      'KeyError', 'AttributeError', 'ZeroDivisionError', 'ModuleNotFoundError', 'EOFError', 'OSError'];
    const runnerKeys: readonly string[] = UI_KEYS.runner;
    for (const type of types) expect(runnerKeys).toContain(hintKeyFor(type));
  });
});
