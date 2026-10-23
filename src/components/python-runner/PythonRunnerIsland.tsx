// Run button, editor and status of one PythonRunner (docs/architecture/components.md, sections 2.4, 2.6, 4.6).
// The static highlighted code is rendered by PythonRunner.astro right before the island, outside React.
// Editing only sets `hidden` on it, so it stays in the DOM (copy button intact) and the first render always
// matches the build HTML. client.ts (worker + Pyodide) is imported on the first click of Run.
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { formatString } from '../../i18n/format';
import type { UiStrings } from '../../i18n/ui';
import type { RunStatus } from '../../lib/pyodide/client';
import { LONG_RUN_HINT_MS } from '../../lib/pyodide/config';
import type { OutputChunk, RunResult } from '../../lib/pyodide/protocol';
import OutputPanel, { appendChunks, type OutputSegment } from './OutputPanel';
import { markPythonReady, usePythonReady } from './python-ready';

export interface PythonRunnerIslandProps {
  code: string;
  stdin?: string;
  figureAlt?: string[];
  lang: 'vi' | 'en'; // number formatting of {{seconds}}
  strings: UiStrings<'runner'>;
}

export type RunnerUiState =
  | { kind: 'idle' }
  // Run was pressed; waiting for client.ts to load or for the first status of the run.
  | { kind: 'starting' }
  | { kind: 'queued'; runId: number }
  | { kind: 'loading'; runId: number; step: 'python' | 'packages'; packages?: string[] }
  | { kind: 'running'; runId: number; longRunning: boolean }
  | { kind: 'finished'; result: RunResult }; // result.status: ok | error | stopped | load-failed

type Client = typeof import('../../lib/pyodide/client');

/** The run this island is waiting for. Callbacks of any other (stopped, replaced) run are ignored. */
interface ActiveRun {
  id?: number; // set once client.runPython has returned
  stop?: Client['stopPython'];
}

const INDENT = '    ';
const MIN_ROWS = 4;
const MAX_ROWS = 30;
const MAX_PACKAGE_NAMES = 3;
const MIN_SHOWN_MS = 100; // {{seconds}} has one decimal
// Import name -> Pyodide package name, where they differ.
const IMPORT_TO_PACKAGE: Readonly<Record<string, string>> = { sklearn: 'scikit-learn' };
// Pressing only these after Esc keeps the "leave on the next Tab" flag (Shift+Tab, for example).
const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta']);
// The static <Code> block and the island share this wrapper (PythonRunner.astro).
const WRAPPER_SELECTOR = '.atlas-runner';
const STATIC_SELECTOR = '[data-runner-static]';

let clientPromise: Promise<Client> | undefined;

function loadClient(): Promise<Client> {
  clientPromise ??= import('../../lib/pyodide/client').catch((error: unknown) => {
    clientPromise = undefined; // let "Try again" fetch the chunk again
    throw error;
  });
  return clientPromise;
}

function emptyResult(status: 'stopped' | 'load-failed'): RunResult {
  return { status, figures: [], figuresDropped: 0, outputTruncated: false, durationMs: 0 };
}

/** Top-level modules the code imports, as Pyodide package names. */
function importedPackages(code: string): Set<string> {
  const names = new Set<string>();
  for (const match of code.matchAll(/^[ \t]*(?:from[ \t]+([\w.]+)[ \t]+import\b|import[ \t]+([^#\n]+))/gm)) {
    const modules = match[1] ? [match[1]] : (match[2] ?? '').split(',');
    for (const module of modules) {
      const top = module.trim().split(/[\s.]/)[0];
      if (top) names.add(IMPORT_TO_PACKAGE[top] ?? top);
    }
  }
  return names;
}

/**
 * Pyodide lists every dependency (matplotlib alone pulls in 12 packages). Show only the packages the code
 * imports itself (or the first ones when none match), at most MAX_PACKAGE_NAMES names, then "+n" for the rest.
 * Example: "matplotlib, numpy +10".
 */
export function packagesLabel(packages: readonly string[], code: string): string {
  const imported = importedPackages(code);
  const direct = packages.filter((name) => imported.has(name));
  const shown = (direct.length > 0 ? direct : packages).slice(0, MAX_PACKAGE_NAMES);
  const rest = packages.length - shown.length;
  return shown.join(', ') + (rest > 0 ? ` +${rest}` : '');
}

function lineCount(text: string): number {
  return text.replace(/\n$/, '').split('\n').length;
}

const schedule = (callback: () => void): number =>
  typeof requestAnimationFrame === 'function' ? requestAnimationFrame(callback) : window.setTimeout(callback, 16);
const unschedule = (handle: number): void =>
  typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(handle) : window.clearTimeout(handle);

export default function PythonRunnerIsland({ code, stdin, figureAlt, lang, strings }: PythonRunnerIslandProps) {
  // Unique per island and stable between build and hydration (section 2.9). Only for id/for/aria-*.
  const uid = useId();
  // A textarea reports "\n" only; a "\r\n" value would make React reset it (and the caret) on each render.
  const original = code.replace(/\r\n?/g, '\n');
  const hasStdin = stdin !== undefined;

  const [ui, setUi] = useState<RunnerUiState>({ kind: 'idle' });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(original);
  const [stdinValue, setStdinValue] = useState(stdin ?? '');
  const [segments, setSegments] = useState<OutputSegment[]>([]);
  const [ranCode, setRanCode] = useState(original);
  const [hasRun, setHasRun] = useState(false);
  const pythonReady = usePythonReady();

  const active = useRef<ActiveRun | null>(null);
  const pendingChunks = useRef<OutputChunk[]>([]);
  const frame = useRef(0);
  const longRunTimer = useRef(0);
  const escaped = useRef(false);
  const focusEditor = useRef(false);
  const runButton = useRef<HTMLButtonElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const root = useRef<HTMLDivElement>(null);

  const busy = ui.kind === 'starting' || ui.kind === 'queued' || ui.kind === 'loading' || ui.kind === 'running';

  // The textarea takes the place of the static block; "Restore" shows the block again.
  useEffect(() => {
    const block = root.current?.closest(WRAPPER_SELECTOR)?.querySelector<HTMLElement>(STATIC_SELECTOR);
    if (block) block.hidden = editing;
  }, [editing]);

  useEffect(() => {
    if (!focusEditor.current) return;
    focusEditor.current = false;
    editor.current?.focus();
  });

  // Unmounted while running: give the worker to the next run.
  useEffect(
    () => () => {
      const run = active.current;
      active.current = null;
      if (run?.id !== undefined) run.stop?.(run.id);
      window.clearTimeout(longRunTimer.current);
      if (frame.current) unschedule(frame.current);
    },
    [],
  );

  function flushOutput(): void {
    if (frame.current) unschedule(frame.current);
    frame.current = 0;
    const chunks = pendingChunks.current;
    pendingChunks.current = [];
    if (chunks.length > 0) setSegments((previous) => appendChunks(previous, chunks));
  }

  function finish(run: ActiveRun, result: RunResult): void {
    if (active.current !== run) return;
    active.current = null;
    window.clearTimeout(longRunTimer.current);
    flushOutput();
    if (result.status === 'ok' || result.status === 'error') markPythonReady();
    setUi({ kind: 'finished', result });
  }

  function onStatus(run: ActiveRun, status: RunStatus, packages?: string[]): void {
    if (active.current !== run) return;
    const runId = run.id ?? 0;
    window.clearTimeout(longRunTimer.current);
    switch (status) {
      case 'queued':
        setUi({ kind: 'queued', runId });
        break;
      case 'loading-python':
        setUi({ kind: 'loading', runId, step: 'python' });
        break;
      case 'loading-packages':
        markPythonReady();
        setUi({ kind: 'loading', runId, step: 'packages', packages });
        break;
      case 'running':
        markPythonReady();
        setUi({ kind: 'running', runId, longRunning: false });
        // Counted from "running" only: loading on a slow network is not a reason to press Stop.
        longRunTimer.current = window.setTimeout(() => {
          if (active.current !== run) return;
          setUi((current) => (current.kind === 'running' ? { ...current, longRunning: true } : current));
        }, LONG_RUN_HINT_MS);
        break;
    }
  }

  function onOutput(run: ActiveRun, chunks: OutputChunk[]): void {
    if (active.current !== run) return;
    // At most one state update per frame, however fast the worker prints.
    pendingChunks.current.push(...chunks);
    if (!frame.current) frame.current = schedule(flushOutput);
  }

  async function start(run: ActiveRun, source: string, input: string | undefined): Promise<void> {
    let client: Client;
    try {
      client = await loadClient();
    } catch {
      finish(run, emptyResult('load-failed'));
      return;
    }
    if (active.current !== run) return; // stopped while client.ts was loading
    const handle = client.runPython(source, {
      stdin: input,
      onStatus: (status, packages) => onStatus(run, status, packages),
      onOutput: (chunks) => onOutput(run, chunks),
    });
    run.id = handle.id;
    run.stop = client.stopPython;
    finish(run, await handle.result);
  }

  function runCode(): void {
    if (busy) return;
    const source = editing ? draft : original;
    const run: ActiveRun = {};
    active.current = run;
    pendingChunks.current = [];
    if (frame.current) unschedule(frame.current);
    frame.current = 0;
    setSegments([]);
    setRanCode(source);
    setHasRun(true);
    setUi({ kind: 'starting' });
    void start(run, source, hasStdin ? stdinValue : undefined);
  }

  function stopCode(): void {
    const run = active.current;
    if (run) {
      if (run.id !== undefined) run.stop?.(run.id); // resolves the run as 'stopped' -> finish()
      else finish(run, emptyResult('stopped'));
    }
    runButton.current?.focus();
  }

  function toggleEditing(): void {
    if (editing) {
      // Restore: drop every change and show the static block again.
      setEditing(false);
      setDraft(original);
      escaped.current = false;
    } else {
      setDraft(original);
      setEditing(true);
      focusEditor.current = true;
    }
  }

  function onEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      runCode();
      return;
    }
    if (event.key === 'Escape') {
      escaped.current = true;
      return;
    }
    if (event.key === 'Tab') {
      // After Esc, or with a modifier, Tab moves focus as usual: the editor is never a keyboard trap.
      if (escaped.current || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
        escaped.current = false;
        return;
      }
      event.preventDefault();
      const textarea = event.currentTarget;
      // execCommand keeps the browser's undo history and fires `input` (-> onChange).
      const inserted = typeof document.execCommand === 'function' && document.execCommand('insertText', false, INDENT);
      if (!inserted) {
        textarea.setRangeText(INDENT, textarea.selectionStart, textarea.selectionEnd, 'end');
        setDraft(textarea.value);
      }
      return;
    }
    if (!MODIFIER_KEYS.has(event.key)) escaped.current = false;
  }

  const seconds = (ms: number) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(ms / 1000);
  const result = ui.kind === 'finished' ? ui.result : undefined;
  const hintId = `${uid}-hint`;

  return (
    <div className="atlas-runner-body" ref={root}>
      {editing && (
        <div className="atlas-runner-editor">
          <textarea
            ref={editor}
            id={`${uid}-code`}
            className="atlas-runner-textarea"
            aria-label={strings.editorLabel}
            aria-describedby={hintId}
            value={draft}
            rows={Math.min(MAX_ROWS, Math.max(MIN_ROWS, lineCount(draft)))}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap="off"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onEditorKeyDown}
            onBlur={() => (escaped.current = false)}
          />
          <p className="atlas-runner-hint" id={hintId}>
            {strings.editorHint}
          </p>
        </div>
      )}

      {hasStdin && (
        <div className="atlas-runner-stdin">
          <label className="atlas-runner-label" htmlFor={`${uid}-stdin`}>
            {strings.input}
          </label>
          <textarea
            id={`${uid}-stdin`}
            className="atlas-runner-textarea"
            value={stdinValue}
            rows={3}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap="off"
            onChange={(event) => setStdinValue(event.target.value)}
          />
        </div>
      )}

      <div className="atlas-runner-actions">
        <button
          type="button"
          ref={runButton}
          className="atlas-runner-button atlas-runner-button-primary"
          aria-disabled={busy ? 'true' : undefined}
          onClick={runCode}
        >
          <span className="atlas-runner-play" aria-hidden="true" />
          {strings.run}
        </button>
        {busy && (
          <button type="button" className="atlas-runner-button" onClick={stopCode}>
            {strings.stop}
          </button>
        )}
        {/* One element for both labels, so focus stays on it after the switch. */}
        <button type="button" className="atlas-runner-button atlas-runner-edit" onClick={toggleEditing}>
          {editing ? strings.reset : strings.edit}
        </button>
      </div>

      <div className="atlas-runner-status" aria-live="polite">
        <StatusText ui={ui} pythonReady={pythonReady} code={ranCode} seconds={seconds} strings={strings} />
      </div>
      {result?.status === 'load-failed' && (
        <button
          type="button"
          className="atlas-runner-button atlas-runner-retry"
          onClick={() => {
            runCode();
            runButton.current?.focus(); // this button goes away while the new run is busy
          }}
        >
          {strings.retry}
        </button>
      )}

      {hasRun && (
        <OutputPanel
          id={`${uid}-output`}
          segments={segments}
          result={result}
          code={ranCode}
          hasStdin={hasStdin}
          // The author's alt text describes the figures of the original code only.
          figureAlt={ranCode === original ? figureAlt : undefined}
          strings={strings}
        />
      )}
    </div>
  );
}

interface StatusTextProps {
  ui: RunnerUiState;
  pythonReady: boolean;
  code: string;
  seconds: (ms: number) => string;
  strings: UiStrings<'runner'>;
}

function StatusText({ ui, pythonReady, code, seconds, strings }: StatusTextProps) {
  const progress = (text: string) => (
    <p className="atlas-runner-progress">
      <span className="atlas-runner-track" aria-hidden="true">
        <span className="atlas-runner-bar" />
      </span>
      {text}
    </p>
  );

  switch (ui.kind) {
    case 'idle':
      return pythonReady ? null : <p className="atlas-runner-note">{strings.firstRunNote}</p>;
    case 'starting':
      // No status yet: the next one is "loading Python" unless Pyodide is already there.
      return progress(pythonReady ? strings.running : strings.loadingPython);
    case 'queued':
      return progress(strings.queued);
    case 'loading':
      return progress(
        ui.step === 'packages' && ui.packages?.length
          ? formatString(strings.loadingPackages, { packages: packagesLabel(ui.packages, code) })
          : strings.loadingPython,
      );
    case 'running':
      return (
        <>
          {progress(strings.running)}
          {ui.longRunning && (
            <p className="atlas-runner-long">
              {formatString(strings.longRunning, { seconds: seconds(LONG_RUN_HINT_MS) })}
            </p>
          )}
        </>
      );
    case 'finished':
      switch (ui.result.status) {
        case 'ok':
          return (
            <p className="atlas-runner-done">
              {/* Rounded up to the shown precision: "0.1 s", never "0 s". */}
              {formatString(strings.done, { seconds: seconds(Math.max(ui.result.durationMs, MIN_SHOWN_MS)) })}
            </p>
          );
        case 'stopped':
          return <p>{strings.stopped}</p>;
        case 'load-failed':
          return (
            <p className="atlas-runner-failed">
              <span className="atlas-cross" aria-hidden="true" />
              {strings.loadFailed}
            </p>
          );
        case 'error':
          // The error box says it all on screen; this line makes the live region say it too (decision 15).
          return <p className="sr-only">{strings.errorTitle}</p>;
      }
  }
}
