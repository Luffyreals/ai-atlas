// What a run printed, its error and its figures (docs/architecture/components.md, sections 2.8, 4.6, 4.9.5).
// Output from Python is only ever set as text (React children); figures are data: URLs of PNGs.
import { formatString } from '../../i18n/format';
import type { UiStrings } from '../../i18n/ui';
import { hintKeyFor } from '../../lib/pyodide/errors';
import type { OutputChunk, PythonErrorInfo, RunResult } from '../../lib/pyodide/protocol';

/** One <span> of the output: adjacent chunks of the same stream joined together. */
export type OutputSegment = OutputChunk;

/** Appends chunks, joining each one to the previous segment when the stream is the same. */
export function appendChunks(segments: OutputSegment[], chunks: readonly OutputChunk[]): OutputSegment[] {
  const next = segments.slice();
  for (const chunk of chunks) {
    const last = next.at(-1);
    if (last?.stream === chunk.stream) next[next.length - 1] = { stream: last.stream, text: last.text + chunk.text };
    else next.push({ stream: chunk.stream, text: chunk.text });
  }
  return next;
}

export interface OutputPanelProps {
  /** id of the <pre>, from useId() of the island. */
  id: string;
  segments: OutputSegment[];
  /** Set once the run has finished. */
  result?: RunResult;
  /** The code that ran: the line of the error is read from it. */
  code: string;
  /** The runner has a `stdin` prop: an EOFError then means "not enough input lines". */
  hasStdin: boolean;
  /** Alt text per figure; the island passes it only when the code that ran is the original. */
  figureAlt?: string[];
  strings: UiStrings<'runner'>;
}

export default function OutputPanel({ id, segments, result, code, hasStdin, figureAlt, strings }: OutputPanelProps) {
  const figures = result?.figures ?? [];
  const error = result?.status === 'error' ? result.error : undefined;
  const hasText = segments.length > 0;
  const noOutput = result?.status === 'ok' && !hasText && figures.length === 0;
  const truncated = result?.outputTruncated === true;
  if (!hasText && !noOutput && !truncated && !error && figures.length === 0) return null;

  return (
    <div className="atlas-runner-output">
      <p className="atlas-runner-output-title">{strings.output}</p>
      {hasText && (
        // Focusable so a keyboard user can scroll long output; a region, so its aria-label is announced.
        <pre className="atlas-runner-pre" id={id} tabIndex={0} role="region" aria-label={strings.output}>
          {segments.map((segment, i) => (
            <span key={i} className={segment.stream === 'stderr' ? 'atlas-runner-stderr' : undefined}>
              {segment.text}
            </span>
          ))}
        </pre>
      )}
      {noOutput && <p className="atlas-runner-note">{strings.noOutput}</p>}
      {truncated && <p className="atlas-runner-note">{strings.outputTruncated}</p>}
      {error && <ErrorBox error={error} code={code} hasStdin={hasStdin} strings={strings} />}
      {figures.length > 0 && (
        <div className="atlas-runner-figures">
          {error && <p className="atlas-runner-figures-note">{strings.figuresBeforeError}</p>}
          {figures.map((src, i) => (
            <img
              key={i}
              className="atlas-runner-figure"
              src={src}
              alt={figureAlt?.[i] ?? formatString(strings.figure, { n: i + 1 })}
              decoding="async"
            />
          ))}
          {(result?.figuresDropped ?? 0) > 0 && (
            <p className="atlas-runner-note">{formatString(strings.figuresTruncated, { count: figures.length })}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface ErrorBoxProps {
  error: PythonErrorInfo;
  code: string;
  hasStdin: boolean;
  strings: UiStrings<'runner'>;
}

function ErrorBox({ error, code, hasStdin, strings }: ErrorBoxProps) {
  // Tracebacks of "<exec>" carry no source line, so the line is taken from the code that ran.
  const sourceLine = error.line === undefined ? undefined : code.split(/\r?\n/)[error.line - 1]?.trimEnd();
  const hint = error.type === 'EOFError' && !hasStdin ? strings.stdinMissing : strings[hintKeyFor(error.type)];

  return (
    <div className="atlas-runner-error">
      <p className="atlas-runner-error-title">
        <span className="atlas-cross" aria-hidden="true" />
        {strings.errorTitle}
      </p>
      <p className="atlas-runner-error-message">{error.message ? `${error.type}: ${error.message}` : error.type}</p>
      {error.line !== undefined && (
        <div className="atlas-runner-error-line">
          <p>{formatString(strings.errorLine, { line: error.line })}</p>
          {sourceLine && (
            <pre>
              <code>{sourceLine}</code>
            </pre>
          )}
        </div>
      )}
      <p className="atlas-runner-error-hint">{hint}</p>
      <details className="atlas-runner-traceback">
        <summary>{strings.showTraceback}</summary>
        <pre>{error.traceback}</pre>
      </details>
    </div>
  );
}
