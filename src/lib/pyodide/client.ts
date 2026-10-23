// Main-thread side of the Python runner: one shared worker per page, a run queue, Stop.
// Imported dynamically on the first click of Run, so nothing here loads with the page.
import { OUTPUT_LIMIT_CHARS } from './config';
import { parsePythonError } from './errors';
import type { OutputChunk, RunResult, WorkerMessage, WorkerOutcome, WorkerRequest } from './protocol';

export type RunStatus = 'queued' | 'loading-python' | 'loading-packages' | 'running';

export interface RunOptions {
  stdin?: string;
  /** 'queued' is sent (after runPython returns) only when the run has to wait for another one. */
  onStatus: (status: RunStatus, packages?: string[]) => void;
  onOutput: (chunks: OutputChunk[]) => void;
}

export interface RunHandle {
  id: number;
  result: Promise<RunResult>; // never rejects
}

export interface WorkerLike {
  postMessage(message: WorkerRequest): void;
  terminate(): void;
  onmessage: ((event: MessageEvent<WorkerMessage>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
}

export interface PythonClient {
  runPython(code: string, options: RunOptions): RunHandle;
  /** Current run: terminate the worker, resolve 'stopped', start the next queued run on a new worker.
   *  Queued run: remove it from the queue, resolve 'stopped'. Unknown or finished id: no-op. */
  stopPython(id: number): void;
}

interface Job {
  id: number;
  code: string;
  options: RunOptions;
  resolve: (result: RunResult) => void;
  outputChars: number;
  runningSince?: number;
}

const FIGURE_PREFIX = 'data:image/png;base64,';

function emptyResult(status: RunResult['status'], durationMs = 0, outputTruncated = false): RunResult {
  return { status, figures: [], figuresDropped: 0, outputTruncated, durationMs };
}

function toResult(outcome: WorkerOutcome): RunResult {
  const result: RunResult = {
    status: outcome.phase === 'ok' ? 'ok' : 'error',
    figures: outcome.figures.map((png) => FIGURE_PREFIX + png),
    figuresDropped: outcome.figuresDropped,
    outputTruncated: outcome.outputTruncated,
    durationMs: outcome.durationMs,
  };
  if (outcome.phase === 'python-error') {
    result.error = parsePythonError(outcome.traceback ?? '', outcome.errorType);
  }
  return result;
}

/** For tests: inject a fake worker factory. */
export function createPythonClient(createWorker: () => WorkerLike): PythonClient {
  let worker: WorkerLike | undefined;
  let current: Job | undefined;
  const queue: Job[] = [];
  let nextId = 1;

  function dropWorker(): void {
    worker?.terminate();
    worker = undefined;
  }

  // Loading failed (or the worker died): end every run, so the page does not hit the CDN again and again.
  // The next click of Run creates a new worker.
  function failAll(): void {
    dropWorker();
    const jobs = current ? [current, ...queue] : [...queue];
    current = undefined;
    queue.length = 0;
    for (const job of jobs) job.resolve(emptyResult('load-failed'));
  }

  function ensureWorker(): WorkerLike {
    if (worker) return worker;
    const created = createWorker();
    // Messages from a terminated worker are ignored.
    created.onmessage = (event) => {
      if (worker === created) handleMessage(event.data);
    };
    created.onerror = (event) => {
      if (worker !== created) return;
      event.preventDefault();
      failAll();
    };
    worker = created;
    return created;
  }

  function startNext(): void {
    if (current) return;
    const job = queue.shift();
    if (!job) return;
    current = job;
    try {
      ensureWorker().postMessage({ type: 'run', id: job.id, code: job.code, stdin: job.options.stdin });
    } catch {
      failAll(); // e.g. the browser refuses to create the worker
    }
  }

  function handleMessage(message: WorkerMessage): void {
    const job = current;
    if (!job || message.id !== job.id) return;
    switch (message.type) {
      case 'status':
        if (message.status === 'running') job.runningSince = performance.now();
        job.options.onStatus(message.status, message.packages);
        break;
      case 'output':
        for (const chunk of message.chunks) job.outputChars += chunk.text.length;
        job.options.onOutput(message.chunks);
        break;
      case 'done':
        if (message.outcome.phase === 'load-error') {
          failAll();
          break;
        }
        current = undefined;
        job.resolve(toResult(message.outcome));
        startNext();
        break;
    }
  }

  function runPython(code: string, options: RunOptions): RunHandle {
    const id = nextId++;
    let resolve!: (result: RunResult) => void;
    const result = new Promise<RunResult>((done) => (resolve = done));
    const job: Job = { id, code, options, resolve, outputChars: 0 };
    queue.push(job);
    if (current) {
      // Deferred so the caller already holds the handle (and its id) when the status arrives.
      queueMicrotask(() => {
        if (queue.includes(job)) options.onStatus('queued');
      });
    }
    startNext();
    return { id, result };
  }

  function stopPython(id: number): void {
    const job = current;
    if (job?.id === id) {
      dropWorker();
      current = undefined;
      const durationMs = job.runningSince === undefined ? 0 : performance.now() - job.runningSince;
      // The worker cuts output at exactly the limit, so reaching it means output was dropped.
      job.resolve(emptyResult('stopped', durationMs, job.outputChars >= OUTPUT_LIMIT_CHARS));
      startNext(); // on a new worker
      return;
    }
    const index = queue.findIndex((queued) => queued.id === id);
    if (index === -1) return;
    const [removed] = queue.splice(index, 1);
    removed.resolve(emptyResult('stopped'));
  }

  return { runPython, stopPython };
}

// The page-wide client. The worker is created lazily on the first run, never at import time.
export const { runPython, stopPython } = createPythonClient(
  () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
);
