// Real Pyodide 314.0.7 tracebacks, copied verbatim from docs/architecture/components.md, Appendix A
// (Node 24.15.0, 23/10/2026, runPythonAsync(code, { globals }) with a fresh globals dict).
// For IndentationError, ZeroDivisionError and EOFError the appendix gives only the part from the
// first "<exec>" frame; it says the Pyodide frames before it are identical to SyntaxError / NameError.

export interface TracebackFixture {
  code: string;
  type: string; // err.type
  traceback: string; // err.message
  expected: { line: number; message: string };
}

const NAME_ERROR_HEAD = `Traceback (most recent call last):
  File "/lib/python314.zip/_pyodide/_base.py", line 619, in eval_code_async
    await CodeRunner(
    ...<10 lines>...
    .run_async(globals, locals)
  File "/lib/python314.zip/_pyodide/_base.py", line 420, in run_async
    coroutine = eval(self.code, globals, locals)
`;

const SYNTAX_ERROR_HEAD = `Traceback (most recent call last):
  File "/lib/python314.zip/_pyodide/_base.py", line 619, in eval_code_async
    await CodeRunner(
          ~~~~~~~~~~^
        source,
        ^^^^^^^
    ...<6 lines>...
        dedent=dedent,
        ^^^^^^^^^^^^^^
    )
    ^
  File "/lib/python314.zip/_pyodide/_base.py", line 294, in __init__
    self.ast = next(self._gen)
               ~~~~^^^^^^^^^^^
  File "/lib/python314.zip/_pyodide/_base.py", line 151, in _parse_and_compile_gen
    mod = compile(source, filename, mode, flags | ast.PyCF_ONLY_AST)
`;

export const TRACEBACKS = {
  NameError: {
    code: 'x = 1\nprint(x)\nprint(y)',
    type: 'NameError',
    traceback: `${NAME_ERROR_HEAD}  File "<exec>", line 3, in <module>
NameError: name 'y' is not defined
`,
    expected: { line: 3, message: "name 'y' is not defined" },
  },
  SyntaxError: {
    code: 'a = 1\nif a > 0\n    print(a)',
    type: 'SyntaxError',
    traceback: `${SYNTAX_ERROR_HEAD}  File "<exec>", line 2
    if a > 0
            ^
SyntaxError: expected ':'
`,
    expected: { line: 2, message: "expected ':'" },
  },
  IndentationError: {
    code: 'def f():\nreturn 1',
    type: 'IndentationError',
    traceback: `${SYNTAX_ERROR_HEAD}  File "<exec>", line 2
    return 1
    ^^^^^^
IndentationError: expected an indented block after function definition on line 1
`,
    expected: { line: 2, message: 'expected an indented block after function definition on line 1' },
  },
  ZeroDivisionError: {
    code: 'def f(n):\n    return 1 / n\n\nprint(f(0))',
    type: 'ZeroDivisionError',
    traceback: `${NAME_ERROR_HEAD}  File "<exec>", line 4, in <module>
  File "<exec>", line 2, in f
ZeroDivisionError: division by zero
`,
    expected: { line: 2, message: 'division by zero' },
  },
  EOFError: {
    code: 'name = input()',
    type: 'EOFError',
    traceback: `${NAME_ERROR_HEAD}  File "<exec>", line 1, in <module>
EOFError: EOF when reading a line
`,
    expected: { line: 1, message: 'EOF when reading a line' },
  },
} satisfies Record<string, TracebackFixture>;
