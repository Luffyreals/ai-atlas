// @vitest-environment jsdom
// SamplingVizIsland (docs/architecture/llm-lessons.md, sections 4.6.3–4.6.7; viz/README.md sections 2.7, 2.8).
// Props are built the way SamplingViz.astro builds them: the real tokens, logits, config, strings and KaTeX.
// Rows are read from the HTML table; controls are found by role and accessible name.
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SETTLE_MS } from '../../../src/components/viz/kit/use-settled';
import SamplingVizIsland, { type SamplingVizIslandProps } from '../../../src/components/viz/sampling-viz/SamplingVizIsland';
import { NEXT_TOKEN, NEXT_TOKEN_SAMPLING } from '../../../src/data/datasets/next-token';
import { formatString } from '../../../src/i18n/format';
import { UI_KEYS, type UiStrings } from '../../../src/i18n/ui';
import { inlineMarkupLabel, renderInlineMarkup } from '../../../src/lib/inline-markup';
import { createRng, sampleIndex, samplingDistribution } from '../../../src/lib/viz/sampling';
// Imported rather than read from disk: under jsdom, import.meta.url is not a file: URL.
import enJson from '../../../src/content/i18n/en.json';
import viJson from '../../../src/content/i18n/vi.json';

type Locale = 'vi' | 'en';
type Strings = UiStrings<'vizSampling'>;

function vizStrings(locale: Locale): Strings {
  const all: Record<string, string> = locale === 'vi' ? viJson : enJson;
  const entries = UI_KEYS.vizSampling.map((key) => {
    const value = all[`atlas.vizSampling.${key}`];
    if (!value) throw new Error(`missing atlas.vizSampling.${key} in ${locale}.json`);
    return [key, value] as const;
  });
  return Object.fromEntries(entries) as Strings;
}

const VI = vizStrings('vi');
const EN = vizStrings('en');
const N = NEXT_TOKEN.logits.length;
const MANY = NEXT_TOKEN_SAMPLING.many;

function islandProps(locale: Locale, strings: Strings = locale === 'vi' ? VI : EN): SamplingVizIslandProps {
  return {
    context: NEXT_TOKEN.context[locale],
    tokens: NEXT_TOKEN.tokens[locale],
    logits: NEXT_TOKEN.logits,
    description: NEXT_TOKEN.description[locale],
    config: NEXT_TOKEN_SAMPLING,
    labels: {
      temperatureHtml: renderInlineMarkup(strings.temperatureLabel),
      temperatureText: inlineMarkupLabel(strings.temperatureLabel),
      topKHtml: renderInlineMarkup(strings.topKLabel),
      topKText: inlineMarkupLabel(strings.topKLabel),
      topPHtml: renderInlineMarkup(strings.topPLabel),
      topPText: inlineMarkupLabel(strings.topPLabel),
    },
    strings,
  };
}

function parts(root: HTMLElement, strings: Strings = VI) {
  const scope = within(root);
  const one = <T extends Element>(selector: string): T => {
    const found = root.querySelectorAll<T>(selector);
    expect(found.length, selector).toBe(1);
    return found[0] as T;
  };
  const rows = () => [...root.querySelectorAll<HTMLTableRowElement>('tbody tr')];
  return {
    t: () => scope.getByRole('slider', { name: inlineMarkupLabel(strings.temperatureLabel) }) as HTMLInputElement,
    k: () => scope.getByRole('slider', { name: inlineMarkupLabel(strings.topKLabel) }) as HTMLInputElement,
    p: () => scope.getByRole('slider', { name: inlineMarkupLabel(strings.topPLabel) }) as HTMLInputElement,
    one: () => scope.getByRole('button', { name: strings.sampleOne }) as HTMLButtonElement,
    many: () => scope.getByRole('button', { name: formatString(strings.sampleMany, { n: MANY }) }) as HTMLButtonElement,
    reset: () => scope.getByRole('button', { name: strings.reset }) as HTMLButtonElement,
    table: () => scope.getByRole('table', { name: strings.tableLabel }),
    rows,
    removedRows: () => rows().filter((row) => row.hasAttribute('data-removed')),
    /** The shown probability of every row: "0.38", or "—" for a removed token. */
    probs: () => rows().map((row) => row.querySelector('td:nth-child(3) .atlas-viz-num')?.textContent),
    counts: () => rows().map((row) => Number(row.querySelector('td:last-child')?.textContent)),
    countCells: () => [...root.querySelectorAll('thead th:last-child, tbody td:last-child')],
    slot: () => one<HTMLElement>('.atlas-viz-slot'),
    status: () => one<HTMLElement>('.atlas-viz-status'),
    live: () => one<HTMLElement>('[aria-live="polite"]'),
  };
}

function setSlider(slider: HTMLInputElement, value: string): void {
  act(() => {
    fireEvent.change(slider, { target: { value } });
  });
}

const click = (button: HTMLButtonElement) => act(() => button.click());

function withFakeTimers(body: () => void): void {
  vi.useFakeTimers();
  try {
    body();
  } finally {
    vi.useRealTimers();
  }
}

const wait = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

/** Counts of `times` draws at the default settings, from a fresh seed: what the island must show. */
function expectedCounts(times: number, settings = { temperature: 1, topK: N, topP: 1 }) {
  const { probs } = samplingDistribution(NEXT_TOKEN.logits, settings);
  const rng = createRng(NEXT_TOKEN_SAMPLING.seed);
  const counts = Array.from({ length: N }, () => 0);
  let last = 0;
  for (let i = 0; i < times; i++) {
    last = sampleIndex(probs, rng());
    counts[last] = (counts[last] ?? 0) + 1;
  }
  return { counts, last };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SamplingVizIsland: build HTML, then hydration', () => {
  it('disables every control in the build HTML, shows the default table, hydrates without mismatch', async () => {
    const element = <SamplingVizIsland {...islandProps('vi')} />;
    const host = document.createElement('div');
    host.innerHTML = renderToString(element, { identifierPrefix: 'r5' });
    document.body.append(host);

    const before = parts(host);
    const controls = [before.t(), before.k(), before.p(), before.one(), before.many(), before.reset()];
    expect(controls.map((c) => c.disabled)).toEqual([true, true, true, true, true, true]);
    // The static table is complete before any JS: 10 rows at T = 1, nothing removed, no token drawn yet.
    expect(before.rows()).toHaveLength(N);
    expect(before.probs().slice(0, 3)).toEqual(['0.38', '0.26', '0.14']);
    expect(before.removedRows()).toHaveLength(0);
    expect(before.slot().textContent?.trim()).toBe('');
    // The count column is in the DOM, hidden, so it keeps its room (no layout shift).
    expect(before.countCells()).toHaveLength(N + 1);
    for (const cell of before.countCells()) expect(cell.hasAttribute('data-off')).toBe(true);

    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverable: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(host, element, { identifierPrefix: 'r5', onRecoverableError: (e) => recoverable.push(e) });
    });
    try {
      expect(recoverable).toEqual([]);
      expect(errors).not.toHaveBeenCalled();
      const after = parts(host);
      expect(after.t()).toBe(controls[0]); // the build DOM was kept
      expect([after.t(), after.k(), after.p(), after.one(), after.many(), after.reset()].map((c) => c.disabled)).toEqual([
        false, false, false, false, false, false,
      ]);
      expect(after.live().textContent).toBe('');
    } finally {
      act(() => root?.unmount());
      host.remove();
    }
  });
});

describe('SamplingVizIsland: sliders', () => {
  it('starts at T = 1 with both cuts off, said in aria-valuetext', () => {
    const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    expect(ui.t().getAttribute('aria-valuetext')).toBe('T = 1.0');
    expect(ui.k().getAttribute('aria-valuetext')).toBe(formatString(VI.topKOff, { total: N }));
    expect(ui.p().getAttribute('aria-valuetext')).toBe(VI.topPOff);
    expect(ui.status().textContent).toBe(formatString(VI.kept, { kept: N, total: N }));
  });

  it('T down to 0: one row with probability 1, nine removed, and the greedy note', () => {
    const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    setSlider(ui.t(), '0');
    expect(ui.probs()).toEqual(['1.00', '—', '—', '—', '—', '—', '—', '—', '—', '—']);
    expect(ui.removedRows()).toHaveLength(N - 1);
    expect(ui.status().textContent).toContain(VI.greedyNote);
    expect(ui.t().getAttribute('aria-valuetext')).toBe('T = 0.0');
  });

  it('top-k = 3: exactly 7 rows say "removed", the three left are 0.49, 0.33, 0.18', () => {
    const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    setSlider(ui.k(), '3');
    const removed = ui.removedRows();
    expect(removed).toHaveLength(7);
    // The word is written out (and visible) in removed rows only; kept rows hold it hidden.
    for (const row of ui.rows()) {
      const word = [...row.querySelectorAll('span')].find((s) => s.textContent === VI.removed);
      expect(word?.hasAttribute('data-off')).toBe(!removed.includes(row));
    }
    expect(ui.probs().slice(0, 3)).toEqual(['0.49', '0.33', '0.18']);
    expect(ui.k().getAttribute('aria-valuetext')).toBe(formatString(VI.topKValueText, { k: 3 }));
  });

  it('top-p = 0.9 keeps 5 tokens at T = 1, 3 at T = 0.5, 7 at T = 1.5 (the lesson\'s numbers)', () => {
    const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    setSlider(ui.p(), '0.9');
    expect(N - ui.removedRows().length).toBe(5);
    expect(ui.probs()[0]).toBe('0.41');
    expect(ui.p().getAttribute('aria-valuetext')).toBe('top-p = 0.90');
    setSlider(ui.t(), '0.5');
    expect(N - ui.removedRows().length).toBe(3);
    setSlider(ui.t(), '1.5');
    expect(N - ui.removedRows().length).toBe(7);
  });

  it('a range value of 0.30000000000000004 is snapped to 0.3', () => {
    const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    setSlider(ui.t(), '0.30000000000000004');
    expect(ui.t().value).toBe('0.3');
  });
});

describe('SamplingVizIsland: drawing tokens', () => {
  it('"Draw 1": the token goes into the slot, its count is 1, and the live region says it at once', () => {
    const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    click(ui.one());
    const { counts, last } = expectedCounts(1);
    const token = NEXT_TOKEN.tokens.vi[last] ?? '';
    expect(ui.slot().textContent).toBe(token);
    expect(ui.counts()).toEqual(counts);
    expect(ui.live().textContent).toBe(formatString(VI.announceSample, { token }));
    for (const cell of ui.countCells()) expect(cell.hasAttribute('data-off')).toBe(false);
  });

  it('"Draw 100" twice: counts add up to 200, the same as the seeded generator gives, and the reading names the top', () => {
    const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    click(ui.many());
    click(ui.many());
    const { counts } = expectedCounts(2 * MANY);
    expect(ui.counts()).toEqual(counts);
    const most = counts.indexOf(Math.max(...counts));
    expect(ui.live().textContent).toBe(
      formatString(VI.announceMany, { n: 2 * MANY, token: NEXT_TOKEN.tokens.vi[most] ?? '', count: counts[most] ?? 0 }),
    );
  });

  it('the same clicks give the same tokens in another island (fixed seed)', () => {
    const a = render(<SamplingVizIsland {...islandProps('vi')} />);
    const ui = parts(a.container);
    click(ui.many());
    const first = ui.counts();
    a.unmount();
    const b = render(<SamplingVizIsland {...islandProps('vi')} />);
    const again = parts(b.container);
    click(again.many());
    expect(again.counts()).toEqual(first);
  });

  it('at T = 0, 100 draws are all the first token', () => {
    const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    setSlider(ui.t(), '0');
    click(ui.many());
    expect(ui.counts()).toEqual([MANY, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('"Draw 100", then moving a slider: counts cleared, the count column hidden, the slot empty', () => {
    const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    click(ui.many());
    expect(ui.counts().reduce((s, c) => s + c, 0)).toBe(MANY);
    setSlider(ui.p(), '0.5');
    expect(ui.counts()).toEqual(Array.from({ length: N }, () => 0));
    for (const cell of ui.countCells()) expect(cell.hasAttribute('data-off')).toBe(true);
    expect(ui.slot().textContent?.trim()).toBe('');
  });

  it('"Reset": sliders back to the defaults, counts cleared, and the seed starts over', () => {
    const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    click(ui.many());
    setSlider(ui.t(), '1.7');
    setSlider(ui.k(), '4');
    setSlider(ui.p(), '0.6');
    click(ui.reset());
    expect([ui.t().value, ui.k().value, ui.p().value]).toEqual(['1', String(N), '1']);
    expect(ui.counts()).toEqual(Array.from({ length: N }, () => 0));
    expect(ui.removedRows()).toHaveLength(0);
    click(ui.many());
    expect(ui.counts()).toEqual(expectedCounts(MANY).counts);
  });
});

describe('SamplingVizIsland: live region', () => {
  it('says nothing after the page loads, however long it waits', () => {
    withFakeTimers(() => {
      const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
      wait(SETTLE_MS * 10);
      expect(parts(container).live().textContent).toBe('');
    });
  });

  it('speaks only once the sliders stop: five changes within 600 ms give one reading, for the last value', () => {
    withFakeTimers(() => {
      const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
      const ui = parts(container);
      const live = ui.live();
      // Read after every step (a MutationObserver would not flush under fake timers).
      const seen: string[] = [];
      for (const [i, value] of ['9', '7', '5', '4', '3'].entries()) {
        if (i > 0) wait(100);
        setSlider(ui.k(), value);
        seen.push(live.textContent ?? '');
      }
      wait(SETTLE_MS - 1);
      seen.push(live.textContent ?? '');
      expect(seen.every((text) => text === '')).toBe(true);
      wait(1);
      const reading = formatString(VI.announce, { kept: 3, total: N, token: 'đẹp', prob: '0.49' });
      expect(live.textContent).toBe(reading);
      wait(SETTLE_MS * 5);
      expect(live.textContent).toBe(reading);
    });
  });

  it('says the reset at once, even when the sliders are already at their start', () => {
    withFakeTimers(() => {
      const { container } = render(<SamplingVizIsland {...islandProps('vi')} />);
      const ui = parts(container);
      click(ui.many());
      click(ui.reset());
      expect(ui.live().textContent).toBe(VI.resetDone);
      wait(SETTLE_MS * 5);
      expect(ui.live().textContent).toBe(VI.resetDone);
    });
  });
});

describe('SamplingVizIsland: no hard-coded text', () => {
  const MARKED = Object.fromEntries(
    UI_KEYS.vizSampling.map((key) => {
      const placeholders = VI[key].match(/\{\{\w+\}\}/g) ?? [];
      return [key, [`⟦${key}⟧`, ...placeholders].join(' ')];
    }),
  ) as Strings;
  const props = islandProps('vi', MARKED);
  const fromProps = new Set([props.context, props.description, ...props.tokens]);
  const NUMBERS_AND_SYMBOLS = /^[0-9.—]+$/;

  function badText(root: HTMLElement): string[] {
    const bad: string[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = (node.textContent ?? '').trim();
      if (!text || text.includes('⟦') || fromProps.has(text) || NUMBERS_AND_SYMBOLS.test(text)) continue;
      if (node.parentElement?.closest('.katex')) continue;
      bad.push(text);
    }
    for (const el of root.querySelectorAll('*')) {
      for (const attr of ['aria-label', 'aria-valuetext', 'title', 'alt', 'placeholder']) {
        const value = el.getAttribute(attr);
        if (value !== null && !value.includes('⟦')) bad.push(`${attr}="${value}"`);
      }
    }
    return bad;
  }

  it('every text node and every accessible text comes from strings or props, in every state', () => {
    withFakeTimers(() => {
      const { container } = render(<SamplingVizIsland {...props} />);
      const ui = parts(container, MARKED);
      const seen = new Set<string>();
      const collect = () => {
        expect(badText(container)).toEqual([]);
        for (const key of UI_KEYS.vizSampling) if (container.innerHTML.includes(`⟦${key}⟧`)) seen.add(key);
      };
      collect();
      click(ui.one());
      collect();
      click(ui.many());
      collect();
      setSlider(ui.k(), '3');
      setSlider(ui.p(), '0.5');
      setSlider(ui.t(), '0');
      wait(SETTLE_MS);
      collect();
      click(ui.reset());
      collect();
      // Control: the check does see a string that is not from strings or props.
      const stray = document.createElement('span');
      stray.textContent = 'Kéo thử';
      ui.status().append(stray);
      expect(badText(container)).toEqual(['Kéo thử']);
      stray.remove();
      expect([...seen].sort()).toEqual([...UI_KEYS.vizSampling].sort());
    });
  });

  it('uses the strings and tokens it is given (en page)', () => {
    const { container } = render(<SamplingVizIsland {...islandProps('en')} />);
    const ui = parts(container, EN);
    expect(container.textContent).toContain(NEXT_TOKEN.context.en);
    expect(ui.rows().map((row) => row.querySelector('th')?.textContent)).toEqual([...NEXT_TOKEN.tokens.en]);
    expect(ui.k().getAttribute('aria-valuetext')).toBe(formatString(EN.topKOff, { total: N }));
  });
});
