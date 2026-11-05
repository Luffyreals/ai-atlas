// BpeMergeViz (docs/architecture/viz/bpe-merge.md). One idea: BPE merges, one step at a time, the adjacent pair
// with the largest count; pieces that come back often (ng, ường_, người_) become tokens, rare syllables stay split.
// "Next step" runs one merge, "Reset" goes back to step 0. Each step shows the pair counts it chose from (winner
// first, in bold), the split of every syllable (the piece just made filled), and the merges learned so far.
// Every string arrives through props (BpeMergeViz.astro). The math is bpe.ts, the same at build time and in the
// browser, so the first render is the build HTML exactly.
import { useId, useMemo, useState } from 'react';
import { formatString } from '../../../i18n/format';
import type { UiStrings } from '../../../i18n/ui';
import { runBpe, type BpeWord, type PairCount } from '../../../lib/viz/bpe';
import { formatNumber } from '../../../lib/viz/format';
import { pct } from '../../../lib/viz/scale';
import { useHydrated } from '../kit/use-hydrated';

export interface BpeMergeVizIslandProps {
  words: readonly BpeWord[]; // BPE_SYLLABLES.words
  end: string; // BPE_SYLLABLES.end
  merges: number; // BPE_SYLLABLES.merges, K
  description: string; // BPE_SYLLABLES.description[locale]
  labels: {
    vocabHtml: string; // KaTeX HTML of strings.vocabLabel and strings.freqCol (renderInlineMarkup)
    freqHtml: string;
  };
  strings: UiStrings<'vizBpeMerge'>;
}

/** Rows of the pair table shown until the reader asks for all of them: the same height at every step. */
const FEW = 8;

const num = (n: number) => formatNumber(n, 0);

export default function BpeMergeVizIsland({ words, end, merges, description, labels, strings }: BpeMergeVizIslandProps) {
  // Unique per island and the same at build time and in the browser (components.md 2.9). Only for id/aria-*.
  const uid = useId();
  const hydrated = useHydrated();
  const run = useMemo(() => runBpe(words, end, merges), [words, end, merges]);
  const total = run.steps.length;
  const [step, setStep] = useState(0);
  const [all, setAll] = useState(false);
  const [live, setLive] = useState('');

  const pairText = (p: PairCount) => formatString(strings.pair, { a: p.a, b: p.b });
  const merged = (p: PairCount) => ({ a: p.a, b: p.b, ab: p.a + p.b, count: num(p.count) });

  /** The status of step k: what it did, then a tie or the end, if any. Every k is laid out (sizers below). */
  const statusOf = (k: number): string => {
    if (k === 0) return formatString(strings.startNote, { size: run.vocab0 });
    const s = run.steps[k - 1];
    if (!s) return '';
    const parts = [formatString(strings.mergedNote, merged(s.pair))];
    const tied = s.counts.filter((c) => c.count === s.pair.count).length;
    if (tied > 1) parts.push(formatString(strings.tieNote, { n: tied, count: num(s.pair.count) }));
    if (k === total) parts.push(formatString(strings.doneNote, { total }));
    return parts.join(' ');
  };
  const sizers = useMemo(() => Array.from({ length: total + 1 }, (_, k) => statusOf(k)), [run, strings]);

  // Step 0 shows the first counts with no winner yet; step k the counts merge k was chosen from.
  const current = step === 0 ? undefined : run.steps[step - 1];
  const counts = (current ?? run.steps[0])?.counts ?? [];
  const splits = current?.splits ?? run.initial;
  const created = current?.symbol;
  // A fixed scale, the largest count of the run: bars shrink as the frequent pairs are merged away.
  const scale = Math.max(1, ...(run.steps[0]?.counts.map((c) => c.count) ?? []));
  const atEnd = step >= total;
  const ids = { pairs: `${uid}-pairs`, rows: `${uid}-rows`, syllables: `${uid}-syl`, desc: `${uid}-desc` };

  const next = () => {
    if (atEnd) {
      setLive(formatString(strings.announceEnd, { total }));
      return;
    }
    const k = step + 1;
    const s = run.steps[k - 1];
    setStep(k);
    if (s) setLive(formatString(strings.announceStep, { step: k, size: run.vocab0 + k, ...merged(s.pair) }));
  };
  const reset = () => {
    if (step === 0) return;
    setStep(0);
    setLive(strings.resetDone);
  };

  return (
    <figure className="atlas-viz-figure" aria-describedby={ids.desc}>
      <figcaption className="atlas-viz-caption">{strings.caption}</figcaption>

      <div className="atlas-viz-control-head">
        <span className="atlas-viz-num">{formatString(strings.stepOf, { step, total })}</span>
        <span>
          {/* Build-time HTML from renderInlineMarkup (escaped text plus KaTeX), never reader input. */}
          <span dangerouslySetInnerHTML={{ __html: labels.vocabHtml }} />{' '}
          <span className="atlas-viz-num">
            {formatString(strings.vocabValue, { start: run.vocab0, step, size: run.vocab0 + step })}
          </span>
        </span>
      </div>

      {/* aria-disabled, not disabled: a button that runs out keeps the focus, and says why when pressed.
          disabled only until hydration (README.md 2.8). */}
      <div className="atlas-viz-choice" role="group" aria-label={strings.controls}>
        <button
          type="button"
          className="atlas-viz-toggle"
          disabled={!hydrated}
          aria-disabled={atEnd ? 'true' : undefined}
          onClick={next}
        >
          {strings.next}
        </button>
        <button
          type="button"
          className="atlas-viz-toggle"
          disabled={!hydrated}
          aria-disabled={step === 0 ? 'true' : undefined}
          onClick={reset}
        >
          {strings.reset}
        </button>
      </div>

      {/* The sentence of this step over the sentences of every step (hidden, aria-hidden): the cell is as tall
          as the longest from the start, so the tables below do not move from step to step. */}
      <div className="atlas-viz-status atlas-viz-status-stack">
        <p>{statusOf(step)}</p>
        {sizers.map((text, k) => (
          <p key={k} aria-hidden="true" data-off>
            {text}
          </p>
        ))}
      </div>

      <div className="atlas-viz-part">
        <span className="atlas-viz-axis-title" id={ids.pairs}>
          {step === 0 ? strings.pairsStart : formatString(strings.pairsLabel, { step })}
        </span>
        <table className="atlas-viz-table" aria-labelledby={ids.pairs}>
          <thead>
            <tr>
              <th scope="col">{strings.pairCol}</th>
              <th scope="col" colSpan={2}>
                {strings.countCol}
              </th>
            </tr>
          </thead>
          <tbody id={ids.rows}>
            {counts.map((c, i) => {
              const pick = current !== undefined && i === 0;
              return (
                <tr key={`${c.a}\u0000${c.b}`} data-pick={pick ? '' : undefined} hidden={!all && i >= FEW}>
                  <th scope="row">
                    {pairText(c)}
                    {pick && <span className="sr-only"> {strings.picked}</span>}
                  </th>
                  <td>
                    <span className="atlas-viz-meter" aria-hidden="true">
                      <span className="atlas-viz-bar" style={{ width: pct((c.count / scale) * 100) }} />
                    </span>
                  </td>
                  <td className="atlas-viz-num">{num(c.count)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {counts.length > FEW && (
        <button
          type="button"
          className="atlas-viz-toggle"
          disabled={!hydrated}
          aria-expanded={all}
          aria-controls={ids.rows}
          onClick={() => setAll(!all)}
        >
          {all ? formatString(strings.showFew, { n: FEW }) : formatString(strings.showAll, { n: counts.length })}
        </button>
      )}

      <div className="atlas-viz-part">
        <span className="atlas-viz-axis-title" id={ids.syllables}>
          {strings.syllablesLabel}
        </span>
        <table className="atlas-viz-table" aria-labelledby={ids.syllables}>
          <thead>
            <tr>
              <th scope="col">{strings.syllableCol}</th>
              <th scope="col">{strings.splitCol}</th>
              <th scope="col" dangerouslySetInnerHTML={{ __html: labels.freqHtml }} />
            </tr>
          </thead>
          <tbody>
            {words.map((w, i) => {
              const pieces = splits[i] ?? [];
              return (
                <tr key={w.word}>
                  <th scope="row">{w.word}</th>
                  <td>
                    <span className="atlas-viz-chips" aria-hidden="true">
                      {pieces.map((piece, j) => (
                        <span key={j} className="atlas-viz-chip" data-new={piece === created ? '' : undefined}>
                          {piece}
                        </span>
                      ))}
                    </span>
                    {/* Adjacent chips would be read as one word: say the pieces with their count. */}
                    <span className="sr-only">
                      {formatString(strings.splitText, { n: pieces.length, pieces: pieces.join(', ') })}
                    </span>
                  </td>
                  <td className="atlas-viz-num">{num(w.freq)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="atlas-viz-part">
        <span className="atlas-viz-axis-title">{strings.mergesLabel}</span>
        {step === 0 ? (
          <span>{strings.noMerges}</span>
        ) : (
          <ol className="atlas-viz-merges">
            {run.steps.slice(0, step).map((s, k) => (
              <li key={k} data-pick={k === step - 1 ? '' : undefined}>
                {formatString(strings.mergeItem, merged(s.pair))}
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="sr-only" id={ids.desc}>
        {description}
      </p>
      {/* Present and empty from the start; only its text changes, so screen readers speak it. */}
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </figure>
  );
}
