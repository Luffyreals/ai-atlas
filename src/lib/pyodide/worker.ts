// Module worker: loads Pyodide from the CDN on the first run, runs one program at a time,
// streams its output and returns matplotlib figures. The user's code is passed to Python unchanged,
// so error line numbers match what the reader sees.
import type { PyodideAPI } from 'pyodide';
import { FIGURE_DPI, MAX_FIGURES, PYODIDE_INDEX_URL } from './config';
import { createLineDecoder, createOutputBuffer } from './output-buffer';
import type { WorkerMessage, WorkerOutcome, WorkerRequest } from './protocol';

type LoadPyodide = typeof import('pyodide').loadPyodide;

interface WorkerScope {
  postMessage(message: WorkerMessage): void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
}

interface Runtime {
  pyodide: PyodideAPI;
  flushStreams: () => void;
  closeFigures: () => void;
  exportFigures: (maxFigures: number, dpi: number) => string; // JSON: [base64 PNGs, dropped count]
}

const scope = self as unknown as WorkerScope;

// Runs in the worker's own namespace, never in the user's globals.
const HELPERS_PY = `
import base64, io, json, sys, warnings

# With the AGG backend, plt.show() does nothing; hide its "cannot be shown" warning.
warnings.filterwarnings('ignore', message='FigureCanvasAgg is non-interactive')

def flush_streams():
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.flush()
        except Exception:
            pass

def close_figures():
    plt = sys.modules.get('matplotlib.pyplot')
    if plt is not None:
        plt.close('all')

def export_figures(max_figures, dpi):
    plt = sys.modules.get('matplotlib.pyplot')
    if plt is None:
        return json.dumps([[], 0])
    numbers = plt.get_fignums()
    figures = []
    for number in numbers[:max_figures]:
        try:
            buffer = io.BytesIO()
            plt.figure(number).savefig(buffer, format='png', dpi=dpi, bbox_inches='tight')
            figures.append(base64.b64encode(buffer.getvalue()).decode('ascii'))
        except Exception:
            pass  # a half-drawn figure that cannot be saved is skipped
    plt.close('all')
    return json.dumps([figures, max(0, len(numbers) - max_figures)])
`;

let runtime: Promise<Runtime> | undefined;
let runtimeReady = false;

async function loadRuntime(): Promise<Runtime> {
  const { loadPyodide } = (await import(/* @vite-ignore */ `${PYODIDE_INDEX_URL}pyodide.mjs`)) as {
    loadPyodide: LoadPyodide;
  };
  const pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });
  pyodide.runPython("import os; os.environ['MPLBACKEND'] = 'AGG'");
  const helpers = pyodide.globals.get('dict')();
  pyodide.runPython(HELPERS_PY, { globals: helpers });
  return {
    pyodide,
    flushStreams: helpers.get('flush_streams'),
    closeFigures: helpers.get('close_figures'),
    exportFigures: helpers.get('export_figures'),
  };
}

function getRuntime(id: number): Promise<Runtime> {
  if (!runtimeReady) post({ type: 'status', id, status: 'loading-python' });
  runtime ??= loadRuntime().then(
    (loaded) => {
      runtimeReady = true;
      return loaded;
    },
    (error: unknown) => {
      runtime = undefined; // the client drops this worker anyway; a retry starts clean
      throw error;
    },
  );
  return runtime;
}

/** Loads the packages the code imports. Pyodide reports a failed download as a message, not a rejection. */
async function loadPackages(pyodide: PyodideAPI, { id, code }: WorkerRequest): Promise<void> {
  let failed = false;
  await pyodide.loadPackagesFromImports(code, {
    messageCallback: (message) => {
      if (message.startsWith('Loading ')) {
        post({ type: 'status', id, status: 'loading-packages', packages: message.slice(8).split(', ') });
      } else if (message.startsWith('Failed to load')) {
        failed = true;
      }
    },
  });
  if (failed) throw new Error('A package failed to load');
}

/** stdin text -> one line per input() call; then EOF. */
function stdinLines(stdin: string | undefined): string[] {
  if (!stdin) return [];
  return stdin.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n');
}

function emptyOutcome(phase: WorkerOutcome['phase']): WorkerOutcome {
  return { phase, figures: [], figuresDropped: 0, outputTruncated: false, durationMs: 0 };
}

async function run(request: WorkerRequest): Promise<WorkerOutcome> {
  let loaded: Runtime;
  try {
    loaded = await getRuntime(request.id);
    await loadPackages(loaded.pyodide, request);
  } catch {
    return emptyOutcome('load-error');
  }
  const { pyodide, flushStreams, closeFigures, exportFigures } = loaded;

  const buffer = createOutputBuffer({ send: (chunks) => post({ type: 'output', id: request.id, chunks }) });
  const stdout = createLineDecoder((line) => buffer.write('stdout', line));
  const stderr = createLineDecoder((line) => buffer.write('stderr', line));
  pyodide.setStdout({ write: (bytes: Uint8Array) => stdout.write(bytes) });
  pyodide.setStderr({ write: (bytes: Uint8Array) => stderr.write(bytes) });
  const lines = stdinLines(request.stdin);
  pyodide.setStdin({ stdin: () => lines.shift() }); // undefined = EOF -> EOFError in input()

  closeFigures(); // figures left over from an earlier run
  post({ type: 'status', id: request.id, status: 'running' });
  const globals = pyodide.globals.get('dict')();
  globals.set('__name__', '__main__');

  const outcome = emptyOutcome('ok');
  const started = performance.now();
  try {
    // dedent: false, so an unexpected indent is an IndentationError, as in CPython.
    const value: unknown = await pyodide.runPythonAsync(request.code, { globals, dedent: false });
    if (value instanceof pyodide.ffi.PyProxy) value.destroy();
  } catch (error) {
    // Anything else is a broken runtime: report it as a load error so the client drops this worker.
    if (!(error instanceof pyodide.ffi.PythonError)) return emptyOutcome('load-error');
    outcome.phase = 'python-error';
    outcome.errorType = error.type;
    outcome.traceback = error.message;
  } finally {
    outcome.durationMs = performance.now() - started;
    flushStreams();
    // Figures are exported even after an error: they show the part that ran correctly.
    try {
      [outcome.figures, outcome.figuresDropped] = JSON.parse(exportFigures(MAX_FIGURES, FIGURE_DPI)) as [
        string[],
        number,
      ];
    } catch {
      // keep the empty list
    }
    stdout.end();
    stderr.end();
    buffer.flush();
    globals.destroy();
  }
  outcome.outputTruncated = buffer.truncated;
  return outcome;
}

function post(message: WorkerMessage): void {
  scope.postMessage(message);
}

// The client sends one run at a time; the chain keeps runs in order even if it did not.
let queue = Promise.resolve();
scope.onmessage = (event) => {
  const request = event.data;
  if (request.type !== 'run') return;
  queue = queue.then(async () => {
    const outcome = await run(request).catch(() => emptyOutcome('load-error'));
    post({ type: 'done', id: request.id, outcome });
  });
};
