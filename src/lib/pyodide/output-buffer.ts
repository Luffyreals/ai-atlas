// Batches stdout/stderr lines in the worker and caps the output of one run.
// Pure (the clock is injectable) so it is unit-tested without Pyodide.
import { FLUSH_INTERVAL_MS, FLUSH_MAX_CHARS, OUTPUT_LIMIT_CHARS } from './config';
import type { OutputChunk } from './protocol';

export interface OutputBufferOptions {
  send: (chunks: OutputChunk[]) => void;
  now?: () => number; // default performance.now
  limit?: number; // default OUTPUT_LIMIT_CHARS
  intervalMs?: number; // default FLUSH_INTERVAL_MS
  maxChars?: number; // default FLUSH_MAX_CHARS
}

export interface OutputBuffer {
  /** Appends '\n'; flushes by time/size; drops everything past the limit. */
  write(stream: OutputChunk['stream'], line: string): void;
  flush(): void;
  readonly truncated: boolean;
}

export function createOutputBuffer({
  send,
  now = () => performance.now(),
  limit = OUTPUT_LIMIT_CHARS,
  intervalMs = FLUSH_INTERVAL_MS,
  maxChars = FLUSH_MAX_CHARS,
}: OutputBufferOptions): OutputBuffer {
  let pending: OutputChunk[] = [];
  let pendingChars = 0;
  let usedChars = 0;
  let truncated = false;
  // -Infinity: the first line goes out at once, so a slow program shows that it has started.
  let lastFlush = Number.NEGATIVE_INFINITY;

  function flush(): void {
    if (pending.length === 0) return;
    const chunks = pending;
    pending = [];
    pendingChars = 0;
    lastFlush = now();
    send(chunks);
  }

  function write(stream: OutputChunk['stream'], line: string): void {
    if (truncated) return;
    let text = `${line}\n`;
    if (usedChars + text.length > limit) {
      // Keep exactly up to the limit. The last chunk may then not end with '\n'.
      text = text.slice(0, limit - usedChars);
      truncated = true;
    }
    usedChars += text.length;
    pendingChars += text.length;

    const last = pending.at(-1);
    if (last?.stream === stream) last.text += text;
    else if (text) pending.push({ stream, text });

    // Time is checked here, not with setTimeout: a running Python program blocks the event loop.
    // Flush on truncation too, since no later write will trigger a flush.
    if (truncated || pendingChars >= maxChars || now() - lastFlush >= intervalMs) flush();
  }

  return {
    write,
    flush,
    get truncated() {
      return truncated;
    },
  };
}

export interface LineDecoder {
  /** Pyodide `Writer.write`: decodes UTF-8 bytes and calls onLine once per complete line. */
  write(bytes: Uint8Array): number;
  /** End of a run: passes on the last unfinished line, if any. */
  end(): void;
}

// The worker uses raw writes instead of `setStdout({ batched })`: in Pyodide 314.0.7 the batched
// handler keeps a trailing `print(..., end="")` even after sys.stdout.flush(), and it leaks into the next run.
export function createLineDecoder(onLine: (line: string) => void): LineDecoder {
  const decoder = new TextDecoder();
  let partial = '';
  return {
    write(bytes) {
      const lines = (partial + decoder.decode(bytes, { stream: true })).split('\n');
      partial = lines.pop() ?? '';
      for (const line of lines) onLine(line);
      return bytes.length;
    },
    end() {
      const rest = partial + decoder.decode();
      partial = '';
      if (rest) onLine(rest);
    },
  };
}
