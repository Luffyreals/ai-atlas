// @vitest-environment jsdom
// PythonRunnerIsland behaviour (docs/architecture/components.md, sections 2.4, 2.6, 2.8, 4.6; plan row M1-6).
// client.ts is mocked: each runPython() call becomes a FakeRun the test drives by hand (status, output, result).
// Elements are found by role and accessible name; the status line has no role, so it is read by its class.
import { act, cleanup, fireEvent, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PythonRunnerIsland, {
  packagesLabel,
  type PythonRunnerIslandProps,
} from '../../../src/components/python-runner/PythonRunnerIsland';
import { resetPythonReady } from '../../../src/components/python-runner/python-ready';
import { formatString } from '../../../src/i18n/format';
import { UI_KEYS, type UiStrings } from '../../../src/i18n/ui';
import type { RunOptions, RunStatus } from '../../../src/lib/pyodide/client';
import { LONG_RUN_HINT_MS } from '../../../src/lib/pyodide/config';
import { parsePythonError } from '../../../src/lib/pyodide/errors';
import type { OutputChunk, RunResult } from '../../../src/lib/pyodide/protocol';
import enJson from '../../../src/content/i18n/en.json';
import viJson from '../../../src/content/i18n/vi.json';
import { TRACEBACKS } from '../fixtures/pyodide-tracebacks';

/** One runPython() call seen by the fake client. */
interface FakeRun {
  id: number;
  code: string;
  options: RunOptions;
  resolve: (result: RunResult) => void;
}

// The island opens client.ts with import() on the first click of Run. The factory waits for `gate`, so the
// first test can press Stop while client.ts is still "loading". Every other test opens the gate first.
const fake = vi.hoisted(() => {
  let open!: () => void;
  const gate = new Promise<void>((resolve) => (open = resolve));
  return { gate, open, runs: [] as FakeRun[], nextId: 41, stopPython: vi.fn<(id: number) => void>() };
});

vi.mock('../../../src/lib/pyodide/client', async () => {
  await fake.gate;
  return {
    // Ids start at 41, so a hard-coded id (0 or 1) in the island cannot pass the Stop test by luck.
    runPython: vi.fn((code: string, options: RunOptions) => {
      const id = fake.nextId++;
      let resolve!: (result: RunResult) => void;
      const result = new Promise<RunResult>((done) => (resolve = done));
      fake.runs.push({ id, code, options, resolve });
      return { id, result };
    }),
    stopPython: fake.stopPython,
  };
});

/** The real runner strings of one locale, as getStrings(t, 'runner') would pass them. */
function runnerStrings(locale: 'vi' | 'en'): UiStrings<'runner'> {
  const all: Record<string, string> = locale === 'vi' ? viJson : enJson;
  const entries = UI_KEYS.runner.map((key) => {
    const value = all[`atlas.runner.${key}`];
    if (!value) throw new Error(`missing atlas.runner.${key} in ${locale}.json`);
    return [key, value] as const;
  });
  return Object.fromEntries(entries) as UiStrings<'runner'>;
}

const VI = runnerStrings('vi');
const EN = runnerStrings('en');

const HELLO = 'print("Hello")\nprint("World")\n';
const PLOT = 'import matplotlib.pyplot as plt\nimport numpy as np\nplt.plot([1, 2])\n';
// Same shape as src/code/dev/error.vi.py: a figure on line 4, NameError on line 6.
const ERROR_CODE = [
  'import matplotlib.pyplot as plt',
  '',
  'x = [0, 1, 2, 3]',
  'plt.plot(x, [v * v for v in x])',
  'total = sum(x)',
  'print(totl)',
].join('\n');
const PNG = 'data:image/png;base64,iVBORw0KGgo=';

function result(partial: Partial<RunResult> = {}): RunResult {
  return { status: 'ok', figures: [], figuresDropped: 0, outputTruncated: false, durationMs: 1234, ...partial };
}

/** NameError at line 6 of ERROR_CODE, parsed from a traceback in the real Pyodide format. */
function nameErrorAtLine6(): RunResult['error'] {
  const traceback = TRACEBACKS.NameError.traceback
    .replace('line 3, in <module>', 'line 6, in <module>')
    .replace("name 'y' is not defined", "name 'totl' is not defined");
  return parsePythonError(traceback, 'NameError');
}

beforeEach(() => {
  fake.runs.length = 0;
  seen = 0;
  fake.stopPython.mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  resetPythonReady();
});

/** Island inside the same wrapper PythonRunner.astro renders, next to a stand-in for the static <Code>. */
function renderRunner(props: Partial<PythonRunnerIslandProps> = {}) {
  const view = render(
    <div className="atlas-runner">
      <div className="atlas-runner-static" data-runner-static="">
        static highlighted code
      </div>
      <PythonRunnerIsland code={HELLO} lang="vi" strings={VI} {...props} />
    </div>,
  );
  const root = view.container.querySelector<HTMLElement>('.atlas-runner')!;
  return { ...view, root, ui: runnerUi(root, props.strings ?? VI) };
}

function runnerUi(root: HTMLElement, strings: UiStrings<'runner'>) {
  const scope = within(root);
  return {
    run: () => scope.getByRole('button', { name: strings.run }),
    stop: () => scope.queryByRole('button', { name: strings.stop }),
    retry: () => scope.queryByRole('button', { name: strings.retry }),
    edit: () => scope.getByRole('button', { name: strings.edit }),
    reset: () => scope.getByRole('button', { name: strings.reset }),
    editor: () => scope.queryByRole('textbox', { name: strings.editorLabel }) as HTMLTextAreaElement | null,
    output: () => scope.queryByLabelText(strings.output, { selector: 'pre' }),
    // aria-live region without a role: the only element read by class.
    status: () => (root.querySelector('.atlas-runner-status')?.textContent ?? '').trim(),
    staticBlock: () => root.querySelector<HTMLElement>('[data-runner-static]')!,
    text: () => root.textContent ?? '',
  };
}

/** Runs already handed to the test by nextRun(). */
let seen = 0;

/** Waits for the next runPython() call the test has not looked at yet. */
async function nextRun(): Promise<FakeRun> {
  await waitFor(() => expect(fake.runs.length).toBeGreaterThan(seen));
  return fake.runs[seen++];
}

async function status(run: FakeRun, value: RunStatus, packages?: string[]): Promise<void> {
  await act(async () => run.options.onStatus(value, packages));
}

async function output(run: FakeRun, chunks: OutputChunk[]): Promise<void> {
  await act(async () => run.options.onOutput(chunks));
}

async function finish(run: FakeRun, value: RunResult): Promise<void> {
  await act(async () => {
    run.resolve(value);
    await Promise.resolve();
  });
}

describe('before client.ts has loaded', () => {
  it('Stop ends the run as "stopped" without calling stopPython, and Run is pressable again', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner();
    expect(ui.status()).toBe(VI.firstRunNote);

    await user.click(ui.run());
    expect(ui.status()).toBe(VI.loadingPython);
    expect(ui.run().getAttribute('aria-disabled')).toBe('true');

    await user.click(ui.stop()!);
    expect(ui.status()).toBe(VI.stopped);
    expect(ui.stop()).toBeNull();
    expect(ui.run().getAttribute('aria-disabled')).toBeNull();
    expect(document.activeElement).toBe(ui.run());

    // client.ts arrives after the Stop: the stopped run must not start anyway.
    await act(async () => {
      fake.open();
      await fake.gate;
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fake.runs).toHaveLength(0);
    expect(fake.stopPython).not.toHaveBeenCalled();
  });
});

describe('after client.ts has loaded', () => {
  beforeEach(() => fake.open());

  it('shows queued -> loadingPython -> loadingPackages -> running -> done, in vi', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner({ code: PLOT });
    expect(ui.status()).toBe(VI.firstRunNote);
    expect(ui.stop()).toBeNull();
    expect(ui.output()).toBeNull();

    await user.click(ui.run());
    const run = await nextRun();
    expect(run.code).toBe(PLOT);
    expect(run.options.stdin).toBeUndefined();

    await status(run, 'queued');
    expect(ui.status()).toBe(VI.queued);
    expect(ui.run().getAttribute('aria-disabled')).toBe('true');
    expect(ui.stop()).not.toBeNull();

    await status(run, 'loading-python');
    expect(ui.status()).toBe(VI.loadingPython);

    // Pyodide lists dependencies too; the label keeps the two the code imports, then "+n".
    const packages = ['numpy', 'cycler', 'matplotlib', 'pyparsing', 'kiwisolver'];
    await status(run, 'loading-packages', packages);
    expect(ui.status()).toBe(formatString(VI.loadingPackages, { packages: 'numpy, matplotlib +3' }));

    await status(run, 'running');
    expect(ui.status()).toBe(VI.running);
    expect(ui.stop()).not.toBeNull();

    await finish(run, result({ durationMs: 1234 }));
    expect(ui.status()).toBe(formatString(VI.done, { seconds: '1,2' }));
    expect(ui.stop()).toBeNull();
    expect(ui.run().getAttribute('aria-disabled')).toBeNull();
    // Pyodide has loaded on this page: the first-run note does not come back.
    expect(ui.text()).not.toContain(VI.firstRunNote);
    // Ran fine, printed nothing.
    expect(ui.text()).toContain(VI.noOutput);
  });

  it('formats seconds per locale and never shows 0 seconds (en)', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner({ lang: 'en', strings: EN });
    await user.click(ui.run());
    const run = await nextRun();
    await status(run, 'running');
    await finish(run, result({ durationMs: 3 }));
    expect(ui.status()).toBe(formatString(EN.done, { seconds: '0.1' }));
  });

  it('while busy, a second click on Run does not start another run', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner();
    await user.click(ui.run());
    const run = await nextRun();
    await status(run, 'running');
    await user.click(ui.run());
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fake.runs).toHaveLength(1);
  });

  it('shows stdout and stderr in one <pre>, and Run again clears the old output', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner();
    await user.click(ui.run());
    const first = await nextRun();
    await status(first, 'running');
    await output(first, [
      { stream: 'stdout', text: 'Hello\n' },
      { stream: 'stdout', text: 'World\n' },
      { stream: 'stderr', text: 'warning!\n' },
    ]);
    await waitFor(() => expect(ui.output()?.textContent).toBe('Hello\nWorld\nwarning!\n'));
    const spans = ui.output()!.querySelectorAll('span');
    expect([...spans].map((span) => [span.className, span.textContent])).toEqual([
      ['', 'Hello\nWorld\n'],
      ['atlas-runner-stderr', 'warning!\n'],
    ]);
    await finish(first, result());
    expect(ui.text()).not.toContain(VI.noOutput);

    await user.click(ui.run());
    const second = await nextRun();
    expect(ui.output()).toBeNull();
    await status(second, 'running');
    await output(second, [{ stream: 'stdout', text: 'again\n' }]);
    await waitFor(() => expect(ui.output()?.textContent).toBe('again\n'));
  });

  it('shows outputTruncated only once a truncated run has finished', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner();
    await user.click(ui.run());
    const run = await nextRun();
    await status(run, 'running');
    await output(run, [{ stream: 'stdout', text: 'x'.repeat(200) + '\n' }]);
    await waitFor(() => expect(ui.output()).not.toBeNull());
    expect(ui.text()).not.toContain(VI.outputTruncated);

    await finish(run, result({ outputTruncated: true }));
    expect(ui.text()).toContain(VI.outputTruncated);
  });

  it('control: no outputTruncated when the run was not truncated', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner();
    await user.click(ui.run());
    const run = await nextRun();
    await output(run, [{ stream: 'stdout', text: 'short\n' }]);
    await finish(run, result({ outputTruncated: false }));
    await waitFor(() => expect(ui.output()?.textContent).toBe('short\n'));
    expect(ui.text()).not.toContain(VI.outputTruncated);
  });

  it('an error shows the error box, the line of code, the hint, and figuresBeforeError above the figure', async () => {
    const user = userEvent.setup();
    const { ui, root } = renderRunner({ code: ERROR_CODE });
    await user.click(ui.run());
    const run = await nextRun();
    await status(run, 'running');
    await finish(run, result({ status: 'error', error: nameErrorAtLine6(), figures: [PNG] }));

    const text = ui.text();
    expect(text).toContain(VI.errorTitle);
    expect(text).toContain("NameError: name 'totl' is not defined");
    expect(text).toContain(formatString(VI.errorLine, { line: 6 }));
    expect(text).toContain('print(totl)');
    expect(text).toContain(VI.hintNameError);
    // On screen the box says it all; the live region only holds an sr-only line, so it is read out too.
    const live = root.querySelector('.atlas-runner-status')!;
    expect(live.getAttribute('aria-live')).toBe('polite');
    expect(ui.status()).toBe(VI.errorTitle);
    expect(live.querySelector('p')?.className).toBe('sr-only');

    const traceback = root.querySelector('details')!;
    expect(within(traceback).getByText(VI.showTraceback).tagName).toBe('SUMMARY');
    expect(traceback.textContent).toContain('File "<exec>", line 6');
    expect(traceback.textContent).not.toContain('_pyodide');

    // Order: error box, then the note, then the figure.
    const note = within(root).getByText(VI.figuresBeforeError);
    const image = within(root).getByRole('img', { name: formatString(VI.figure, { n: 1 }) });
    expect(image.getAttribute('src')).toBe(PNG);
    expect(note.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const box = within(root.querySelector('.atlas-runner-error')!).getByText(VI.errorTitle);
    expect(box.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('control: figures of a run without error have no figuresBeforeError, and use figureAlt', async () => {
    const user = userEvent.setup();
    const { ui, root } = renderRunner({ code: PLOT, figureAlt: ['A straight line'] });
    await user.click(ui.run());
    const run = await nextRun();
    await finish(run, result({ figures: [PNG, PNG] }));
    expect(ui.text()).not.toContain(VI.figuresBeforeError);
    expect(within(root).getByRole('img', { name: 'A straight line' })).toBeTruthy();
    // No alt for the second figure: the default "Biểu đồ 2".
    expect(within(root).getByRole('img', { name: formatString(VI.figure, { n: 2 }) })).toBeTruthy();
    expect(ui.text()).not.toContain(VI.noOutput);
  });

  it('figureAlt describes the original code only: edited code gets the default "Biểu đồ n"', async () => {
    const user = userEvent.setup();
    const { ui, root } = renderRunner({ code: PLOT, figureAlt: ['A straight line'] });
    await user.click(ui.edit());
    // Opened but not changed: still the original code, so still the author's alt text.
    await user.click(ui.run());
    await finish(await nextRun(), result({ figures: [PNG] }));
    expect(within(root).getByRole('img', { name: 'A straight line' })).toBeTruthy();

    await user.type(ui.editor()!, 'plt.show()');
    await user.click(ui.run());
    await finish(await nextRun(), result({ figures: [PNG] }));
    expect(within(root).queryByRole('img', { name: 'A straight line' })).toBeNull();
    expect(within(root).getByRole('img', { name: formatString(VI.figure, { n: 1 }) })).toBeTruthy();
  });

  it('the output <pre> is a focusable region named "Kết quả"', async () => {
    const user = userEvent.setup();
    const { ui, root } = renderRunner();
    await user.click(ui.run());
    const run = await nextRun();
    await status(run, 'running');
    await output(run, [{ stream: 'stdout', text: 'Hello\n' }]);
    await waitFor(() => expect(ui.output()).not.toBeNull());
    const region = within(root).getByRole('region', { name: VI.output });
    expect(region).toBe(ui.output());
    expect(region.tabIndex).toBe(0);
  });

  it('shows figuresTruncated when figures were dropped', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner({ code: PLOT });
    await user.click(ui.run());
    const run = await nextRun();
    await finish(run, result({ figures: Array(10).fill(PNG), figuresDropped: 2 }));
    expect(ui.text()).toContain(formatString(VI.figuresTruncated, { count: 10 }));
  });

  const EOF_ERROR = () => parsePythonError(TRACEBACKS.EOFError.traceback, 'EOFError');

  it('EOFError without a stdin prop shows stdinMissing, not hintEOFError', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner({ code: TRACEBACKS.EOFError.code });
    await user.click(ui.run());
    const run = await nextRun();
    expect(ui.text()).not.toContain(VI.stdinMissing);
    await finish(run, result({ status: 'error', error: EOF_ERROR() }));
    expect(ui.text()).toContain(VI.stdinMissing);
    expect(ui.text()).not.toContain(VI.hintEOFError);
  });

  it('EOFError with a stdin prop shows hintEOFError; the edited input box is what runs', async () => {
    const user = userEvent.setup();
    const { ui, root } = renderRunner({ code: TRACEBACKS.EOFError.code, stdin: 'Lan\n20' });
    const input = within(root).getByRole('textbox', { name: VI.input }) as HTMLTextAreaElement;
    expect(input.value).toBe('Lan\n20');
    await user.clear(input);
    await user.type(input, 'Minh');

    await user.click(ui.run());
    const run = await nextRun();
    expect(run.options.stdin).toBe('Minh');
    await finish(run, result({ status: 'error', error: EOF_ERROR() }));
    expect(ui.text()).toContain(VI.hintEOFError);
    expect(ui.text()).not.toContain(VI.stdinMissing);
  });

  it('Stop calls stopPython with the id of its own run, then shows "stopped" and focuses Run', async () => {
    const user = userEvent.setup();
    const view = render(
      <>
        <div className="atlas-runner" data-testid="one">
          <div data-runner-static="" />
          <PythonRunnerIsland code={HELLO} lang="vi" strings={VI} />
        </div>
        <div className="atlas-runner" data-testid="two">
          <div data-runner-static="" />
          <PythonRunnerIsland code={PLOT} lang="vi" strings={VI} />
        </div>
      </>,
    );
    const one = runnerUi(view.getByTestId('one'), VI);
    const two = runnerUi(view.getByTestId('two'), VI);

    await user.click(one.run());
    const first = await nextRun();
    await status(first, 'running');
    await user.click(two.run());
    const second = await nextRun();
    expect(second.code).toBe(PLOT);
    expect(second.id).not.toBe(first.id);
    await status(second, 'queued');
    expect(two.status()).toBe(VI.queued);

    await user.click(two.stop()!);
    expect(fake.stopPython).toHaveBeenCalledTimes(1);
    expect(fake.stopPython).toHaveBeenCalledWith(second.id);
    expect(document.activeElement).toBe(two.run());

    // The real client resolves a stopped run as 'stopped'.
    await finish(second, result({ status: 'stopped', durationMs: 0 }));
    expect(two.status()).toBe(VI.stopped);
    expect(two.stop()).toBeNull();
    // Runner one is not affected.
    expect(one.status()).toBe(VI.running);
    expect(one.stop()).not.toBeNull();

    await user.click(one.stop()!);
    expect(fake.stopPython).toHaveBeenLastCalledWith(first.id);
  });

  it('ignores output that a stopped run sends late', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner();
    await user.click(ui.run());
    const run = await nextRun();
    await status(run, 'running');
    await output(run, [{ stream: 'stdout', text: 'before\n' }]);
    await waitFor(() => expect(ui.output()?.textContent).toBe('before\n'));
    await user.click(ui.stop()!);
    await finish(run, result({ status: 'stopped' }));

    await output(run, [{ stream: 'stdout', text: 'late\n' }]);
    await status(run, 'running');
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(ui.output()?.textContent).toBe('before\n');
    expect(ui.status()).toBe(VI.stopped);
  });

  it('load-failed shows the message and Try again, which starts a new run', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner();
    await user.click(ui.run());
    const first = await nextRun();
    await status(first, 'loading-python');
    await finish(first, result({ status: 'load-failed', durationMs: 0 }));

    expect(ui.status()).toBe(VI.loadFailed);
    const retry = ui.retry();
    expect(retry).not.toBeNull();
    expect(retry!.getAttribute('type')).toBe('button');
    // Loading failed, so Pyodide is not ready: no "done", and the button is not a stale Stop.
    expect(ui.stop()).toBeNull();

    await user.click(retry!);
    const second = await nextRun();
    expect(second.code).toBe(HELLO);
    expect(ui.retry()).toBeNull();
    expect(document.activeElement).toBe(ui.run());
    expect(ui.status()).toBe(VI.loadingPython);

    await status(second, 'running');
    await finish(second, result());
    expect(ui.status()).toBe(formatString(VI.done, { seconds: '1,2' }));
    expect(ui.retry()).toBeNull();
  });

  it('Edit hides the static block and opens the editor; Restore drops the edits and shows the block again', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner();
    expect(ui.staticBlock().hidden).toBe(false);
    expect(ui.editor()).toBeNull();

    const toggle = ui.edit();
    await user.click(toggle);
    expect(ui.staticBlock().hidden).toBe(true);
    const editor = ui.editor()!;
    expect(editor.value).toBe(HELLO);
    expect(document.activeElement).toBe(editor);
    // Same element, new label.
    expect(ui.reset()).toBe(toggle);

    await user.clear(editor);
    await user.type(editor, 'print(1)');
    await user.click(ui.run());
    const edited = await nextRun();
    expect(edited.code).toBe('print(1)');
    await finish(edited, result());

    await user.click(ui.reset());
    expect(ui.editor()).toBeNull();
    expect(ui.staticBlock().hidden).toBe(false);
    expect(ui.edit()).toBe(toggle);

    await user.click(ui.run());
    const original = await nextRun();
    expect(original.code).toBe(HELLO);
    await finish(original, result());

    // Edit again: the editor starts from the original code, not the old draft.
    await user.click(ui.edit());
    expect(ui.editor()!.value).toBe(HELLO);
  });

  it('Ctrl+Enter (and Cmd+Enter) in the editor runs the edited code; plain Enter types a newline', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner({ code: 'a = 1' });
    await user.click(ui.edit());
    const editor = ui.editor()!;
    await user.click(editor);
    await user.keyboard('{End}{Enter}print(a)');
    expect(fake.runs).toHaveLength(0);
    expect(editor.value).toBe('a = 1\nprint(a)');

    await user.keyboard('{Control>}{Enter}{/Control}');
    const first = await nextRun();
    expect(first.code).toBe('a = 1\nprint(a)');
    expect(editor.value).toBe('a = 1\nprint(a)'); // Ctrl+Enter adds no newline
    await finish(first, result());

    await user.keyboard('{Meta>}{Enter}{/Meta}');
    const second = await nextRun();
    expect(second.code).toBe('a = 1\nprint(a)');
  });

  it('Tab in the editor inserts 4 spaces; after Esc, Tab leaves the editor', async () => {
    const user = userEvent.setup();
    const { ui } = renderRunner({ code: 'x' });
    await user.click(ui.edit());
    const editor = ui.editor()!;
    await user.click(editor);
    await user.keyboard('{Home}');
    await user.tab();
    expect(editor.value).toBe('    x');
    expect(document.activeElement).toBe(editor);

    await user.keyboard('{Escape}');
    await user.tab();
    expect(editor.value).toBe('    x');
    expect(document.activeElement).not.toBe(editor);
  });

  it('every button of the runner is type="button"', async () => {
    const user = userEvent.setup();
    const { ui, root } = renderRunner();
    await user.click(ui.run());
    await nextRun();
    const buttons = within(root).getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    for (const button of buttons) expect(button.getAttribute('type')).toBe('button');
  });

  it('a runner that was never run shows no output panel', () => {
    const { ui } = renderRunner();
    expect(ui.text()).not.toContain(VI.output);
  });
});

describe('longRunning hint (fake timers)', () => {
  beforeEach(() => fake.open());

  /** Run pressed with real timers (client.ts loads through promises), then the clock is faked. */
  async function startWithFakeClock(code = HELLO) {
    const view = renderRunner({ code });
    fireEvent.click(view.ui.run());
    const run = await nextRun();
    vi.useFakeTimers();
    return { ...view, run };
  }

  async function advance(ms: number): Promise<void> {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  }

  const hint = formatString(VI.longRunning, { seconds: '10' });

  it('appears 10 s after "running" and goes away when the run finishes', async () => {
    const { ui, run } = await startWithFakeClock();
    await status(run, 'running');
    await advance(LONG_RUN_HINT_MS - 1);
    expect(ui.text()).not.toContain(hint);

    await advance(1);
    expect(ui.text()).toContain(hint);
    expect(ui.status()).toContain(VI.running);

    await finish(run, result({ durationMs: 12_000 }));
    expect(ui.text()).not.toContain(hint);
    expect(ui.status()).toBe(formatString(VI.done, { seconds: '12' }));
  });

  it('does not count time spent queued or loading', async () => {
    const { ui, run } = await startWithFakeClock(PLOT);
    await status(run, 'queued');
    await advance(LONG_RUN_HINT_MS + 1_000);
    await status(run, 'loading-python');
    await advance(LONG_RUN_HINT_MS + 1_000);
    await status(run, 'loading-packages', ['numpy']);
    await advance(LONG_RUN_HINT_MS + 1_000);
    expect(ui.text()).not.toContain(hint);

    await status(run, 'running');
    await advance(LONG_RUN_HINT_MS - 1);
    expect(ui.text()).not.toContain(hint);
    await advance(1);
    expect(ui.text()).toContain(hint);
  });

  it('is cleared by Stop and does not appear later', async () => {
    const { ui, run } = await startWithFakeClock();
    await status(run, 'running');
    await advance(5_000);
    await act(async () => fireEvent.click(ui.stop()!));
    expect(fake.stopPython).toHaveBeenCalledWith(run.id);
    await finish(run, result({ status: 'stopped' }));
    await advance(LONG_RUN_HINT_MS * 2);
    expect(ui.text()).not.toContain(hint);
    expect(ui.status()).toBe(VI.stopped);
  });

  it('uses the locale of the page (en)', async () => {
    const view = renderRunner({ lang: 'en', strings: EN });
    fireEvent.click(view.ui.run());
    const run = await nextRun();
    vi.useFakeTimers();
    await status(run, 'running');
    await advance(LONG_RUN_HINT_MS);
    expect(view.ui.text()).toContain(formatString(EN.longRunning, { seconds: '10' }));
  });
});

describe('packagesLabel', () => {
  it('keeps the packages the code imports (sklearn -> scikit-learn), at most 3, then +n', () => {
    const code = 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n';
    expect(packagesLabel(['scipy', 'numpy', 'joblib', 'scikit-learn'], code)).toBe('numpy, scikit-learn +2');
  });

  it('falls back to the first packages when none is imported directly', () => {
    expect(packagesLabel(['a', 'b', 'c', 'd', 'e'], 'print(1)')).toBe('a, b, c +2');
    expect(packagesLabel(['a'], 'print(1)')).toBe('a');
  });
});
