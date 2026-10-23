import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { createPythonClient } from '../../src/lib/pyodide/client';
import type { RunOptions, WorkerLike } from '../../src/lib/pyodide/client';
import { OUTPUT_LIMIT_CHARS } from '../../src/lib/pyodide/config';
import type { RunResult, WorkerMessage, WorkerOutcome, WorkerRequest } from '../../src/lib/pyodide/protocol';
import { TRACEBACKS } from './fixtures/pyodide-tracebacks';

class FakeWorker implements WorkerLike {
  posted: WorkerRequest[] = [];
  terminated = false;
  onmessage: ((event: MessageEvent<WorkerMessage>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  postMessage(message: WorkerRequest): void {
    this.posted.push(message);
  }
  terminate(): void {
    this.terminated = true;
  }
  emit(message: WorkerMessage): void {
    this.onmessage?.({ data: message } as MessageEvent<WorkerMessage>);
  }
  done(id: number, outcome: Partial<WorkerOutcome> = {}): void {
    this.emit({ type: 'done', id, outcome: { ...OK, ...outcome } });
  }
  crash(): void {
    this.onerror?.({ preventDefault: () => {} } as ErrorEvent);
  }
}

const OK: WorkerOutcome = { phase: 'ok', figures: [], figuresDropped: 0, outputTruncated: false, durationMs: 12 };

function setup() {
  const workers: FakeWorker[] = [];
  const client = createPythonClient(() => {
    const worker = new FakeWorker();
    workers.push(worker);
    return worker;
  });
  return { client, workers };
}

function options(): { onStatus: Mock<RunOptions['onStatus']>; onOutput: Mock<RunOptions['onOutput']> } {
  return { onStatus: vi.fn<RunOptions['onStatus']>(), onOutput: vi.fn<RunOptions['onOutput']>() };
}

/** Resolves with 'pending' if the promise has not settled yet. */
async function peek(result: Promise<RunResult>): Promise<RunResult | 'pending'> {
  return Promise.race([result, new Promise<'pending'>((resolve) => setTimeout(() => resolve('pending'), 0))]);
}

describe('createPythonClient', () => {
  it('creates no worker until the first run', () => {
    const { client, workers } = setup();
    expect(workers).toHaveLength(0);
    client.runPython('print(1)', options());
    expect(workers).toHaveLength(1);
    expect(workers[0].posted).toEqual([{ type: 'run', id: 1, code: 'print(1)', stdin: undefined }]);
  });

  it('forwards status and output, then resolves an ok result with data: URLs', async () => {
    const { client, workers } = setup();
    const opts = options();
    const run = client.runPython('print(1)', { ...opts, stdin: 'Alice' });
    const [worker] = workers;
    expect(worker.posted[0].stdin).toBe('Alice');
    worker.emit({ type: 'status', id: run.id, status: 'loading-packages', packages: ['numpy'] });
    worker.emit({ type: 'status', id: run.id, status: 'running' });
    worker.emit({ type: 'output', id: run.id, chunks: [{ stream: 'stdout', text: '1\n' }] });
    worker.done(run.id, { figures: ['iVBOR'], figuresDropped: 2 });

    expect(opts.onStatus.mock.calls).toEqual([['loading-packages', ['numpy']], ['running', undefined]]);
    expect(opts.onOutput).toHaveBeenCalledWith([{ stream: 'stdout', text: '1\n' }]);
    expect(await run.result).toEqual({
      status: 'ok',
      figures: ['data:image/png;base64,iVBOR'],
      figuresDropped: 2,
      outputTruncated: false,
      durationMs: 12,
    });
  });

  it('turns a python-error outcome into a parsed error', async () => {
    const { client, workers } = setup();
    const fixture = TRACEBACKS.ZeroDivisionError;
    const run = client.runPython(fixture.code, options());
    workers[0].done(run.id, { phase: 'python-error', errorType: fixture.type, traceback: fixture.traceback });
    const result = await run.result;
    expect(result.status).toBe('error');
    expect(result.error).toMatchObject({ type: 'ZeroDivisionError', line: 2, message: 'division by zero' });
  });

  it('queues a second run and starts it when the first is done', async () => {
    const { client, workers } = setup();
    const first = client.runPython('a', options());
    const secondOptions = options();
    const second = client.runPython('b', secondOptions);
    const [worker] = workers;
    expect(worker.posted.map((request) => request.id)).toEqual([first.id]);

    await Promise.resolve(); // 'queued' is sent after runPython returns
    expect(secondOptions.onStatus).toHaveBeenCalledWith('queued');

    // Messages for an id other than the current run are ignored.
    worker.emit({ type: 'status', id: second.id, status: 'running' });
    expect(secondOptions.onStatus).toHaveBeenCalledTimes(1);

    worker.done(first.id);
    expect((await first.result).status).toBe('ok');
    expect(worker.posted.map((request) => request.id)).toEqual([first.id, second.id]);
    expect(workers).toHaveLength(1); // same worker, Pyodide stays loaded
    worker.done(second.id);
    expect((await second.result).status).toBe('ok');
  });

  it('does not send "queued" to a run that starts at once', async () => {
    const { client } = setup();
    const opts = options();
    client.runPython('a', opts);
    await Promise.resolve();
    expect(opts.onStatus).not.toHaveBeenCalled();
  });

  it('Stop on the current run: stopped, old worker terminated, the queued run moves to a new worker', async () => {
    const { client, workers } = setup();
    const first = client.runPython('while True: pass', options());
    const second = client.runPython('print(2)', options());
    const [oldWorker] = workers;

    client.stopPython(first.id);
    expect((await first.result).status).toBe('stopped');
    expect(oldWorker.terminated).toBe(true);
    expect(workers).toHaveLength(2);
    const newWorker = workers[1];
    expect(newWorker.posted.map((request) => request.id)).toEqual([second.id]);
    expect(oldWorker.posted.map((request) => request.id)).toEqual([first.id]);

    // A late message from the terminated worker does not reach the new run.
    oldWorker.done(second.id);
    expect(await peek(second.result)).toBe('pending');

    newWorker.done(second.id);
    expect((await second.result).status).toBe('ok');
    expect(newWorker.terminated).toBe(false);
  });

  it('Stop on a queued run: it leaves the queue without terminating the worker', async () => {
    const { client, workers } = setup();
    const first = client.runPython('a', options());
    const secondOptions = options();
    const second = client.runPython('b', secondOptions);
    const third = client.runPython('c', options());

    client.stopPython(second.id);
    expect((await second.result).status).toBe('stopped');
    await Promise.resolve();
    expect(secondOptions.onStatus).not.toHaveBeenCalled(); // left before 'queued' was sent
    expect(workers[0].terminated).toBe(false);

    workers[0].done(first.id);
    expect(workers[0].posted.map((request) => request.id)).toEqual([first.id, third.id]);
    expect(workers).toHaveLength(1);
  });

  it('ignores Stop for an unknown or finished id', async () => {
    const { client, workers } = setup();
    const run = client.runPython('a', options());
    workers[0].done(run.id);
    await run.result;
    client.stopPython(run.id);
    client.stopPython(999);
    expect(workers[0].terminated).toBe(false);
  });

  it('reports truncated output for a run stopped after reaching the limit', async () => {
    const { client, workers } = setup();
    const run = client.runPython('while True: print(1)', options());
    workers[0].emit({
      type: 'output',
      id: run.id,
      chunks: [{ stream: 'stdout', text: 'x'.repeat(OUTPUT_LIMIT_CHARS) }],
    });
    client.stopPython(run.id);
    expect(await run.result).toMatchObject({ status: 'stopped', outputTruncated: true });
  });

  it('load error: the current and every queued run end load-failed; the next run gets a new worker', async () => {
    const { client, workers } = setup();
    const first = client.runPython('a', options());
    const second = client.runPython('b', options());
    const third = client.runPython('c', options());

    workers[0].done(first.id, { phase: 'load-error' });
    const results = await Promise.all([first.result, second.result, third.result]);
    expect(results.map((result) => result.status)).toEqual(['load-failed', 'load-failed', 'load-failed']);
    expect(workers[0].terminated).toBe(true);
    expect(workers[0].posted).toHaveLength(1); // the queued runs never reached the CDN

    const retry = client.runPython('a', options());
    expect(workers).toHaveLength(2);
    expect(workers[1].posted.map((request) => request.id)).toEqual([retry.id]);
  });

  it('worker error event: every run ends load-failed', async () => {
    const { client, workers } = setup();
    const first = client.runPython('a', options());
    const second = client.runPython('b', options());
    workers[0].crash();
    expect((await first.result).status).toBe('load-failed');
    expect((await second.result).status).toBe('load-failed');
    expect(workers[0].terminated).toBe(true);
  });

  it('a worker that cannot be created ends the run load-failed', async () => {
    const client = createPythonClient(() => {
      throw new Error('blocked');
    });
    const run = client.runPython('a', options());
    expect((await run.result).status).toBe('load-failed');
  });
});
