// SamplingViz (docs/architecture/llm-lessons.md, section 4.6). One idea: the model gives a probability
// distribution over the next token; temperature makes it sharp or flat without changing the order, top-k and
// top-p cut the tail and renormalise, and only then is a token drawn.
// Three sliders (T, k, p) redraw a real HTML table of probabilities at once; two buttons draw 1 or 100 tokens
// with a fixed seed, so the same clicks always give the same tokens; "Reset" brings everything back.
// Every string arrives through props (SamplingViz.astro). The math is sampling.ts: Math.exp only, so the first
// render in the browser is the build HTML exactly.
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { formatString } from '../../../i18n/format';
import type { UiStrings } from '../../../i18n/ui';
import { formatNumber } from '../../../lib/viz/format';
import { createRng, sampleIndex, samplingDistribution, type SamplingConfig } from '../../../lib/viz/sampling';
import { pct } from '../../../lib/viz/scale';
import { useHydrated } from '../kit/use-hydrated';
import { useSettled } from '../kit/use-settled';
import VizSlider from '../kit/VizSlider';

export interface SamplingVizIslandProps {
  context: string; // NEXT_TOKEN.context[locale]
  tokens: readonly string[]; // NEXT_TOKEN.tokens[locale], most likely first
  logits: readonly number[]; // NEXT_TOKEN.logits, one per token
  description: string; // NEXT_TOKEN.description[locale]: describes the table
  config: SamplingConfig;
  labels: {
    temperatureHtml: string; // KaTeX HTML of the slider labels (renderInlineMarkup)
    temperatureText: string; // their accessible names (inlineMarkupLabel)
    topKHtml: string;
    topKText: string;
    topPHtml: string;
    topPText: string;
  };
  strings: UiStrings<'vizSampling'>;
}

/** Index of the largest value; ties go to the lowest index (the more likely token). */
function argmax(values: readonly number[]): number {
  return values.reduce((best, v, i) => (v > (values[best] ?? v) ? i : best), 0);
}

export default function SamplingVizIsland({
  context,
  tokens,
  logits,
  description,
  config,
  labels,
  strings,
}: SamplingVizIslandProps) {
  // Unique per island and the same at build time and in the browser (components.md 2.9). Only for id/for/aria-*.
  const uid = useId();
  const hydrated = useHydrated();
  const [temperature, setTemperature] = useState<number>(config.temperature.initial);
  const [topK, setTopK] = useState<number>(config.topK.initial);
  const [topP, setTopP] = useState<number>(config.topP.initial);
  // Draws since the last reset or slider change: a count is only meaningful for one distribution.
  const [counts, setCounts] = useState<readonly number[]>(() => tokens.map(() => 0));
  const [last, setLast] = useState<number | null>(null);
  const [live, setLive] = useState('');
  // Not state: it never shows on the page, and it must not restart on a re-render.
  const rng = useRef<() => number>(null);

  const n = tokens.length;
  const { probs, kept, base } = useMemo(
    () => samplingDistribution(logits, { temperature, topK, topP }),
    [logits, temperature, topK, topP],
  );
  const keptCount = kept.filter(Boolean).length;
  const total = counts.reduce((sum, c) => sum + c, 0);
  const prob = (p: number) => formatNumber(p, config.digits.prob);

  const keptText = formatString(strings.kept, { kept: keptCount, total: n });
  const announce = () => {
    const top = argmax(probs);
    return formatString(strings.announce, { kept: keptCount, total: n, token: tokens[top] ?? '', prob: prob(probs[top] ?? 0) });
  };

  // The live region speaks once the sliders have stayed put SETTLE_MS (one reading per drag); a button speaks
  // at once (below). Nothing on page load.
  const settled = useSettled(`${temperature} ${topK} ${topP}`);
  useEffect(() => {
    if (settled === undefined) return;
    setLive(announce());
  }, [settled]);

  const clearDraws = () => {
    setCounts(tokens.map(() => 0));
    setLast(null);
  };
  const onSlider = (set: (value: number) => void) => (value: number) => {
    set(value);
    clearDraws();
  };

  const draw = (times: number) => {
    rng.current ??= createRng(config.seed);
    const next = [...counts];
    let index = 0;
    for (let i = 0; i < times; i++) {
      index = sampleIndex(probs, rng.current());
      next[index] = (next[index] ?? 0) + 1;
    }
    setCounts(next);
    setLast(index);
    if (times === 1) {
      setLive(formatString(strings.announceSample, { token: tokens[index] ?? '' }));
    } else {
      const most = argmax(next);
      setLive(
        formatString(strings.announceMany, {
          n: next.reduce((sum, c) => sum + c, 0),
          token: tokens[most] ?? '',
          count: next[most] ?? 0,
        }),
      );
    }
  };

  const reset = () => {
    setTemperature(config.temperature.initial);
    setTopK(config.topK.initial);
    setTopP(config.topP.initial);
    clearDraws();
    rng.current = createRng(config.seed);
    // Said at once, so a reset with the sliders already at their start is not silent; when the sliders do move,
    // their new values are read out once they settle.
    setLive(strings.resetDone);
  };

  const kOff = topK >= n;
  const pOff = topP >= 1;
  const ids = { t: `${uid}-t`, k: `${uid}-k`, p: `${uid}-p`, desc: `${uid}-desc` };
  const countsOff = total === 0 ? '' : undefined;

  return (
    <figure className="atlas-viz-figure">
      <figcaption className="atlas-viz-caption">{strings.caption}</figcaption>

      <div className="atlas-viz-context">
        <span className="atlas-viz-axis-title">{strings.contextLabel}</span>
        <p>
          {/* A no-break space while empty: the same line box as with a token, so nothing below moves. */}
          {context} <strong className="atlas-viz-slot">{last === null ? ' ' : tokens[last]}</strong>
        </p>
      </div>

      <table className="atlas-viz-table" aria-describedby={ids.desc}>
        <caption className="sr-only">{strings.tableLabel}</caption>
        <thead>
          <tr>
            <th scope="col">{strings.tokenCol}</th>
            <th scope="col" colSpan={2}>
              {strings.probCol}
            </th>
            <th scope="col" data-off={countsOff}>
              {strings.countCol}
            </th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, i) => {
            const on = kept[i] === true;
            const p = probs[i] ?? 0;
            const b = base[i] ?? 0;
            return (
              <tr key={token} data-removed={on ? undefined : ''}>
                <th scope="row">{token}</th>
                <td>
                  {/* The faint bar is the softmax before cutting; the solid one what is left after it. */}
                  <span className="atlas-viz-meter" aria-hidden="true">
                    {b > 0 && <span className="atlas-viz-bar-base" style={{ width: pct(b * 100) }} />}
                    {p > 0 && <span className="atlas-viz-bar" style={{ width: pct(p * 100) }} />}
                  </span>
                </td>
                <td>
                  {on ? (
                    <span className="atlas-viz-num">{prob(p)}</span>
                  ) : (
                    <span className="atlas-viz-num" aria-hidden="true">
                      —
                    </span>
                  )}{' '}
                  {/* Kept rows hold the word too, hidden, so the column keeps its width. */}
                  <span data-off={on ? '' : undefined}>{strings.removed}</span>
                </td>
                <td className="atlas-viz-num" data-off={countsOff}>
                  {counts[i] ?? 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="atlas-viz-controls" role="group" aria-label={strings.controls}>
        <VizSlider
          id={ids.t}
          labelHtml={labels.temperatureHtml}
          ariaLabel={labels.temperatureText}
          spec={config.temperature}
          value={temperature}
          display={formatNumber(temperature, config.digits.temperature)}
          valueText={formatString(strings.temperatureValueText, {
            value: formatNumber(temperature, config.digits.temperature),
          })}
          disabled={!hydrated}
          onChange={onSlider(setTemperature)}
        />
        <VizSlider
          id={ids.k}
          labelHtml={labels.topKHtml}
          ariaLabel={labels.topKText}
          spec={config.topK}
          value={topK}
          display={kOff ? strings.off : formatNumber(topK, 0)}
          valueText={
            kOff ? formatString(strings.topKOff, { total: n }) : formatString(strings.topKValueText, { k: topK })
          }
          disabled={!hydrated}
          onChange={onSlider(setTopK)}
        />
        <VizSlider
          id={ids.p}
          labelHtml={labels.topPHtml}
          ariaLabel={labels.topPText}
          spec={config.topP}
          value={topP}
          display={pOff ? strings.off : formatNumber(topP, config.digits.topP)}
          valueText={
            pOff
              ? strings.topPOff
              : formatString(strings.topPValueText, { value: formatNumber(topP, config.digits.topP) })
          }
          disabled={!hydrated}
          onChange={onSlider(setTopP)}
        />
      </div>

      <div className="atlas-viz-choice">
        <button type="button" className="atlas-viz-toggle" disabled={!hydrated} onClick={() => draw(1)}>
          {strings.sampleOne}
        </button>
        <button type="button" className="atlas-viz-toggle" disabled={!hydrated} onClick={() => draw(config.many)}>
          {formatString(strings.sampleMany, { n: config.many })}
        </button>
        <button type="button" className="atlas-viz-toggle" disabled={!hydrated} onClick={reset}>
          {strings.reset}
        </button>
      </div>

      <div className="atlas-viz-status">
        <p>{keptText}</p>
        {temperature === 0 && <p>{strings.greedyNote}</p>}
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
