import { describe, expect, it, vi } from 'vitest';
import { FLUSH_INTERVAL_MS, FLUSH_MAX_CHARS, OUTPUT_LIMIT_CHARS } from '../../../src/lib/pyodide/config';
import { createLineDecoder, createOutputBuffer } from '../../../src/lib/pyodide/output-buffer';
import type { OutputChunk } from '../../../src/lib/pyodide/protocol';

/** A buffer on a manual clock; `sent` collects every batch. */
function setup(options: { limit?: number; maxChars?: number } = {}) {
  let time = 1000;
  const sent: OutputChunk[][] = [];
  const buffer = createOutputBuffer({ send: (chunks) => sent.push(chunks), now: () => time, ...options });
  const advance = (ms: number) => {
    time += ms;
  };
  const text = () => sent.flat().map((chunk) => chunk.text).join('');
  return { buffer, sent, advance, text };
}

describe('createOutputBuffer', () => {
  it('sends the first line at once, then batches lines until 50 ms have passed', () => {
    const { buffer, sent, advance } = setup();
    buffer.write('stdout', 'first');
    expect(sent).toEqual([[{ stream: 'stdout', text: 'first\n' }]]);

    buffer.write('stdout', 'a');
    advance(FLUSH_INTERVAL_MS - 1);
    buffer.write('stdout', 'b');
    expect(sent).toHaveLength(1);

    advance(1);
    buffer.write('stdout', 'c'); // 50 ms after the last send: checked inside write
    expect(sent).toHaveLength(2);
    expect(sent[1]).toEqual([{ stream: 'stdout', text: 'a\nb\nc\n' }]);
  });

  it('does not rely on timers', () => {
    vi.useFakeTimers();
    try {
      const { buffer, sent } = setup();
      buffer.write('stdout', 'first');
      buffer.write('stdout', 'waiting');
      vi.advanceTimersByTime(10 * FLUSH_INTERVAL_MS);
      expect(sent).toHaveLength(1); // nothing is sent without a write or flush()
      buffer.flush();
      expect(sent[1]).toEqual([{ stream: 'stdout', text: 'waiting\n' }]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('sends early when the batch reaches FLUSH_MAX_CHARS', () => {
    const { buffer, sent } = setup();
    buffer.write('stdout', 'first');
    const line = 'x'.repeat(1023); // 1024 chars with '\n'
    for (let i = 0; i < FLUSH_MAX_CHARS / 1024 - 1; i++) buffer.write('stdout', line);
    expect(sent).toHaveLength(1);
    buffer.write('stdout', line);
    expect(sent).toHaveLength(2);
    expect(sent[1][0].text).toHaveLength(FLUSH_MAX_CHARS);
  });

  it('merges neighbouring lines of the same stream and keeps the stream order', () => {
    const { buffer, sent } = setup();
    buffer.write('stdout', 'first');
    buffer.write('stdout', 'a');
    buffer.write('stdout', 'b');
    buffer.write('stderr', 'warn');
    buffer.write('stdout', 'c');
    buffer.flush();
    expect(sent[1]).toEqual([
      { stream: 'stdout', text: 'a\nb\n' },
      { stream: 'stderr', text: 'warn\n' },
      { stream: 'stdout', text: 'c\n' },
    ]);
  });

  it('flush() does nothing when there is nothing to send', () => {
    const { buffer, sent } = setup();
    buffer.flush();
    expect(sent).toEqual([]);
  });

  it(`cuts at exactly ${OUTPUT_LIMIT_CHARS} characters, counting stdout and stderr together`, () => {
    const { buffer, text, advance } = setup();
    const line = '0123456789'.repeat(9) + '012345678'; // 100 chars with '\n'
    for (let i = 0; i < OUTPUT_LIMIT_CHARS / 100 - 1; i++) {
      buffer.write(i % 2 ? 'stderr' : 'stdout', line);
      advance(1);
    }
    expect(buffer.truncated).toBe(false);
    buffer.write('stdout', 'y'.repeat(150)); // only 100 of its 151 chars fit
    expect(buffer.truncated).toBe(true);
    buffer.write('stdout', 'dropped');
    buffer.flush();
    expect(text()).toHaveLength(OUTPUT_LIMIT_CHARS);
    expect(text().endsWith('y'.repeat(100))).toBe(true);
    expect(text()).not.toContain('dropped');
  });

  it('sends the kept part at once when the limit is reached', () => {
    const { buffer, sent } = setup({ limit: 10 });
    buffer.write('stdout', 'abc'); // sent at once (first line)
    buffer.write('stdout', 'defghijkl'); // within 50 ms, but truncation flushes
    expect(sent.flat().map((chunk) => chunk.text)).toEqual(['abc\n', 'defghi']);
    expect(buffer.truncated).toBe(true);
  });

  it('stays untruncated when output ends exactly at the limit', () => {
    const { buffer, text } = setup({ limit: 4 });
    buffer.write('stdout', 'abc');
    buffer.flush();
    expect(text()).toBe('abc\n');
    expect(buffer.truncated).toBe(false);
  });
});

describe('createLineDecoder', () => {
  const encode = (text: string) => new TextEncoder().encode(text);

  it('splits raw writes into lines and keeps the unfinished one until end()', () => {
    const lines: string[] = [];
    const decoder = createLineDecoder((line) => lines.push(line));
    expect(decoder.write(encode('a\nb'))).toBe(3);
    decoder.write(encode('c\n\nd'));
    expect(lines).toEqual(['a', 'bc', '']);
    decoder.end();
    expect(lines).toEqual(['a', 'bc', '', 'd']);
    decoder.end(); // nothing left
    expect(lines).toHaveLength(4);
  });

  it('decodes a UTF-8 character split across two writes', () => {
    const lines: string[] = [];
    const decoder = createLineDecoder((line) => lines.push(line));
    const bytes = encode('hồi quy\n');
    decoder.write(bytes.slice(0, 2));
    decoder.write(bytes.slice(2));
    expect(lines).toEqual(['hồi quy']);
  });
});
