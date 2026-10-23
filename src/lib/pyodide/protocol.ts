// Messages between the main thread (client.ts) and the Pyodide worker (worker.ts), plus run results.
// Types only: safe to import from both sides.

export type WorkerRequest = { type: 'run'; id: number; code: string; stdin?: string };

export interface OutputChunk {
  stream: 'stdout' | 'stderr';
  text: string; // ends with '\n'
}

export type WorkerMessage =
  | {
      type: 'status';
      id: number;
      status: 'loading-python' | 'loading-packages' | 'running';
      packages?: string[];
    }
  | { type: 'output'; id: number; chunks: OutputChunk[] } // batched (output-buffer.ts)
  | { type: 'done'; id: number; outcome: WorkerOutcome };

export interface WorkerOutcome {
  phase: 'ok' | 'python-error' | 'load-error'; // load-error: Pyodide or a package failed to load
  errorType?: string; // PythonError.type, e.g. 'NameError'
  traceback?: string; // PythonError.message (raw, with Pyodide frames)
  figures: string[]; // base64 PNG without the data: prefix
  figuresDropped: number; // figures beyond MAX_FIGURES
  outputTruncated: boolean;
  durationMs: number; // time inside runPythonAsync only
}

export interface PythonErrorInfo {
  type: string; // 'NameError', 'SyntaxError', ...
  message: string; // "name 'y' is not defined"
  line?: number; // last File "<exec>", line N
  traceback: string; // header + frames from the first "<exec>" frame on
}

export interface RunResult {
  status: 'ok' | 'error' | 'stopped' | 'load-failed';
  figures: string[]; // 'data:image/png;base64,...'
  figuresDropped: number;
  outputTruncated: boolean;
  error?: PythonErrorInfo; // only when status === 'error'
  durationMs: number;
}
