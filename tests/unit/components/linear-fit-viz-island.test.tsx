// @vitest-environment jsdom
// LinearFitVizIsland (docs/architecture/viz/, sections 2.7, 2.8, 4.5–4.8; task V4 in section 6).
// Props are built the way LinearFitViz.astro builds them: the real dataset, config, strings and KaTeX.
// Marks are counted inside .atlas-viz-plot only: the key and the readouts draw swatches with the same classes.
// Controls are found by role and accessible name; the live region and the readouts have no role, so they are
// read by class.
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SETTLE_MS } from '../../../src/components/viz/kit/use-settled';
import type { AxisText } from '../../../src/components/viz/kit/types';
import LinearFitVizIsland, { type LinearFitVizIslandProps } from '../../../src/components/viz/linear-fit-viz/LinearFitVizIsland';
import { APARTMENTS, APARTMENTS_LINEAR_FIT } from '../../../src/data/datasets/apartments';
import type { DatasetColumn } from '../../../src/data/datasets/types';
import { formatString } from '../../../src/i18n/format';
import { UI_KEYS, type UiStrings } from '../../../src/i18n/ui';
import { inlineMarkupLabel, renderInlineMarkup } from '../../../src/lib/inline-markup';
import { formatNumber, MINUS } from '../../../src/lib/viz/format';
import { fitLeastSquares, meanPoint, mse, predict, type Line } from '../../../src/lib/viz/linear-fit';
import { clamp, clipLineToBox, pct, toPercentX, toPercentY } from '../../../src/lib/viz/scale';
// Imported rather than read from disk: under jsdom, import.meta.url is not a file: URL.
import enJson from '../../../src/content/i18n/en.json';
import viJson from '../../../src/content/i18n/vi.json';
import { PYTHON_LINEAR_FIT } from '../fixtures/linear-fit-python';

type Locale = 'vi' | 'en';
type Strings = UiStrings<'vizLinearFit'>;

/** The real VIZ strings of one locale, as getStrings(t, 'vizLinearFit') would pass them. */
function vizStrings(locale: Locale): Strings {
  const all: Record<string, string> = locale === 'vi' ? viJson : enJson;
  const entries = UI_KEYS.vizLinearFit.map((key) => {
    const value = all[`atlas.vizLinearFit.${key}`];
    if (!value) throw new Error(`missing atlas.vizLinearFit.${key} in ${locale}.json`);
    return [key, value] as const;
  });
  return Object.fromEntries(entries) as Strings;
}

const VI = vizStrings('vi');
const EN = vizStrings('en');
const ROWS = APARTMENTS.rows;
const CONFIG = APARTMENTS_LINEAR_FIT;
const { digits, xDomain, yDomain } = CONFIG;
const BEST = fitLeastSquares(ROWS);
const MEAN = meanPoint(ROWS);
const N = ROWS.length;
const INITIAL: Line = { w: CONFIG.w.initial, b: CONFIG.b.initial };
// The slider grid point closest to the least-squares line (viz/linear-fit.md 4.5.1).
const NEAREST: Line = { w: 0.17, b: 2 };

function axisText(column: DatasetColumn, locale: Locale): AxisText {
  return { name: column.name[locale], unit: column.unit[locale], title: `${column.name[locale]} (${column.unit[locale]})` };
}

/** Same props as LinearFitViz.astro passes for a page in `locale`. */
function islandProps(locale: Locale, strings: Strings = locale === 'vi' ? VI : EN): LinearFitVizIslandProps {
  return {
    rows: ROWS,
    config: CONFIG,
    best: BEST,
    mean: MEAN,
    axes: { x: axisText(APARTMENTS.x, locale), y: axisText(APARTMENTS.y, locale) },
    itemLabel: APARTMENTS.itemLabel[locale],
    description: APARTMENTS.description[locale],
    labels: {
      wHtml: renderInlineMarkup(strings.wLabel),
      wText: inlineMarkupLabel(strings.wLabel),
      bHtml: renderInlineMarkup(strings.bLabel),
      bText: inlineMarkupLabel(strings.bLabel),
    },
    symbols: { yHat: renderInlineMarkup(String.raw`$\hat{y}$`), x: renderInlineMarkup('$x$') },
    strings,
  };
}

const UNITS = {
  vi: { xUnit: APARTMENTS.x.unit.vi, yUnit: APARTMENTS.y.unit.vi },
  en: { xUnit: APARTMENTS.x.unit.en, yUnit: APARTMENTS.y.unit.en },
};

/** Text without KaTeX (its MathML copy repeats every symbol), whitespace collapsed. */
function plainText(element: Element | null | undefined): string {
  if (!element) return '';
  const copy = element.cloneNode(true) as Element;
  for (const katex of copy.querySelectorAll('.katex')) katex.remove();
  return (copy.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** The parts of one island, found by role and name where they have one. */
function parts(root: HTMLElement, strings: Strings = VI) {
  const scope = within(root);
  const plotName = formatString(strings.plotLabel, {
    count: N,
    x: APARTMENTS.x.name[strings === EN ? 'en' : 'vi'],
    y: APARTMENTS.y.name[strings === EN ? 'en' : 'vi'],
  });
  const one = <T extends Element>(selector: string, from: ParentNode = root): T => {
    const found = from.querySelectorAll<T>(selector);
    expect(found.length, selector).toBe(1);
    return found[0] as T;
  };
  return {
    w: () => scope.getByRole('slider', { name: inlineMarkupLabel(strings.wLabel) }) as HTMLInputElement,
    b: () => scope.getByRole('slider', { name: inlineMarkupLabel(strings.bLabel) }) as HTMLInputElement,
    toggle: () => scope.getByRole('button', { name: strings.showBest }) as HTMLButtonElement,
    controls: () => scope.getByRole('group', { name: strings.controls }),
    svg: () => scope.getByRole('img', { name: plotName }),
    plot: () => one<HTMLElement>('.atlas-viz-plot'),
    key: () => one<HTMLUListElement>('ul.atlas-viz-key'),
    readouts: () => [...root.querySelectorAll<HTMLElement>('.atlas-viz-readout')],
    status: () => one<HTMLElement>('.atlas-viz-status'),
    live: () => one<HTMLElement>('[aria-live="polite"]'),
    /** The number shown next to a slider's label (aria-hidden; aria-valuetext says it). */
    shown: (slider: HTMLInputElement) => slider.parentElement?.querySelector('.atlas-viz-control-head .atlas-viz-num')?.textContent,
    /** "MSE = …" at the end of readout n (0: your line, 1: the best line). */
    mseOf: (n: number) => root.querySelectorAll('.atlas-viz-readout')[n]?.querySelector(':scope > .atlas-viz-num')?.textContent,
    /** "= 0.1695 + 2.04": the equation of readout n, without the KaTeX ŷ and x. */
    equationOf: (n: number) => plainText(root.querySelectorAll('.atlas-viz-readout')[n]?.querySelector('.atlas-viz-readout-text .atlas-viz-num')),
  };
}

const lineAttrs = (line: Element | null | undefined) =>
  line ? (['x1', 'y1', 'x2', 'y2'] as const).map((name) => line.getAttribute(name)) : null;

/** Where the island must draw `line` (clipped to the box), as % strings; null when it misses the box. */
function expectedLine(line: Line): (string | null)[] | null {
  const segment = clipLineToBox(line, xDomain, yDomain);
  if (!segment) return null;
  return [
    pct(toPercentX(segment.x1, xDomain)),
    pct(toPercentY(segment.y1, yDomain)),
    pct(toPercentX(segment.x2, xDomain)),
    pct(toPercentY(segment.y2, yDomain)),
  ];
}

/** x1, y1, x2, y2 of every residual: vertical, from the point to the line, ends clamped to the y domain. */
function expectedResiduals(line: Line): string[][] {
  return ROWS.map(([x, y]) => [
    pct(toPercentX(x, xDomain)),
    pct(toPercentY(clamp(y, yDomain), yDomain)),
    pct(toPercentX(x, xDomain)),
    pct(toPercentY(clamp(predict(line, x), yDomain), yDomain)),
  ]);
}

const mseText = (line: Line, strings: Strings = VI) =>
  formatString(strings.mseValue, { value: formatNumber(mse(ROWS, line), digits.mse) });

function setSlider(slider: HTMLInputElement, value: string): void {
  act(() => {
    fireEvent.change(slider, { target: { value } });
  });
}

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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('LinearFitVizIsland: (a) build HTML, then hydration', () => {
  it('disables both sliders and the button in the build HTML, hydrates without mismatch, then enables them', async () => {
    // @astrojs/react passes the same identifierPrefix to renderToString and hydrateRoot (components.md 2.9).
    const element = <LinearFitVizIsland {...islandProps('vi')} />;
    const markup = renderToString(element, { identifierPrefix: 'r5' });
    const host = document.createElement('div');
    host.innerHTML = markup;
    document.body.append(host);

    const before = parts(host);
    const [w, b, toggle] = [before.w(), before.b(), before.toggle()];
    expect([w.disabled, b.disabled, toggle.disabled]).toEqual([true, true, true]);
    // The static picture is complete before any JS: points, residuals, × and the MSE of the first line.
    expect(before.plot().querySelectorAll('circle.atlas-viz-point')).toHaveLength(N);
    expect(before.plot().querySelectorAll('line.atlas-viz-error')).toHaveLength(N);
    expect(before.plot().querySelectorAll('line.atlas-viz-marker')).toHaveLength(2);
    expect(before.mseOf(0)).toBe(formatString(VI.mseValue, { value: '10.5020' }));

    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverable: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(host, element, {
        identifierPrefix: 'r5',
        onRecoverableError: (error) => recoverable.push(error),
      });
    });
    try {
      expect(recoverable).toEqual([]);
      expect(errors).not.toHaveBeenCalled();
      const after = parts(host);
      // Hydration kept the build DOM: a mismatch would have thrown it away and rendered new nodes.
      expect(after.w()).toBe(w);
      expect(after.toggle()).toBe(toggle);
      expect([w.disabled, b.disabled, toggle.disabled]).toEqual([false, false, false]);
      expect(after.live().textContent).toBe('');
    } finally {
      act(() => root?.unmount());
      host.remove();
    }
  });
});

describe('LinearFitVizIsland: (b) first render', () => {
  it('starts from w = 0, b = 10.9: values, aria-valuetext with units, MSE and the equation', () => {
    const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    const [w, b] = [ui.w(), ui.b()];

    expect([w.min, w.max, w.step, w.value]).toEqual(['0', '0.4', '0.005', '0']);
    expect([b.min, b.max, b.step, b.value]).toEqual(['-10.5', '12', '0.1', '10.9']);
    expect(ui.shown(w)).toBe('0.0000');
    expect(ui.shown(b)).toBe('10.90');
    expect(w.getAttribute('aria-valuetext')).toBe('0.0000 triệu đồng/tháng cho mỗi m²');
    expect(b.getAttribute('aria-valuetext')).toBe('10.90 triệu đồng/tháng');
    expect(w.getAttribute('aria-valuetext')).toBe(formatString(VI.wValueText, { value: '0.0000', ...UNITS.vi }));

    // MSE of the first line, the same number as the fixture from Python and the lesson ("MSE 10.5020").
    expect(formatNumber(PYTHON_LINEAR_FIT.initial.mse, digits.mse)).toBe('10.5020');
    expect(ui.mseOf(0)).toBe('MSE = 10.5020');
    expect(ui.equationOf(0)).toBe('= 0.0000 + 10.90');
    // The best line's row is laid out but hidden, with the lesson's numbers.
    expect(ui.mseOf(1)).toBe('MSE = 0.3615');
    expect(ui.equationOf(1)).toBe('= 0.1695 + 2.04');
    expect(plainText(ui.readouts()[0])).toContain(VI.yourLine);
    expect(plainText(ui.readouts()[1])).toContain(VI.bestLine);
  });

  it('draws N points and N residuals in the plot, your line, and the best line switched off', () => {
    const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    const plot = ui.plot();

    const points = [...plot.querySelectorAll('circle.atlas-viz-point')];
    expect(points).toHaveLength(N);
    expect(points.map((point) => [point.getAttribute('cx'), point.getAttribute('cy')])).toEqual(
      ROWS.map(([x, y]) => [pct(toPercentX(x, xDomain)), pct(toPercentY(y, yDomain))]),
    );
    const residuals = [...plot.querySelectorAll('line.atlas-viz-error')];
    expect(residuals).toHaveLength(N);
    expect(residuals.map(lineAttrs)).toEqual(expectedResiduals(INITIAL));

    const primary = plot.querySelectorAll('line.atlas-viz-primary');
    expect(primary).toHaveLength(1);
    expect(lineAttrs(primary[0])).toEqual(expectedLine(INITIAL));

    const reference = plot.querySelectorAll('line.atlas-viz-reference');
    expect(reference).toHaveLength(1);
    expect(reference[0]?.hasAttribute('data-off')).toBe(true);
    expect(lineAttrs(reference[0])).toEqual(expectedLine(BEST));
    expect(ui.readouts()).toHaveLength(2);
    expect(ui.readouts()[0]?.hasAttribute('data-off')).toBe(false);
    expect(ui.readouts()[1]?.hasAttribute('data-off')).toBe(true);
    expect(ui.toggle().getAttribute('aria-pressed')).toBe('false');
    expect(ui.status().textContent).toBe('');
    expect(container.querySelector('.atlas-viz-near')).toBeNull();
  });

  it('marks the mean point with an × (2 marker and 2 halo strokes) at (x̄, ȳ) in the plot', () => {
    const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
    const plot = parts(container).plot();
    const markers = [...plot.querySelectorAll('line.atlas-viz-marker')];
    const halos = [...plot.querySelectorAll('line.atlas-viz-halo')];
    expect(markers).toHaveLength(2);
    expect(halos).toHaveLength(2);

    // One nested <svg> moves the origin to the mean point; every stroke of the × sits inside it.
    const holder = markers[0]?.parentElement;
    expect(holder?.tagName.toLowerCase()).toBe('svg');
    for (const stroke of [...markers, ...halos]) expect(stroke.parentElement).toBe(holder);
    expect(holder?.getAttribute('x')).toBe(pct(toPercentX(MEAN.x, xDomain)));
    expect(holder?.getAttribute('y')).toBe(pct(toPercentY(MEAN.y, yDomain)));
    expect([holder?.getAttribute('x'), holder?.getAttribute('y')]).toEqual(['52.40%', '45.40%']);
    // A 12px × centred on that origin; the halo is drawn first, under the marker.
    expect(markers.map(lineAttrs)).toEqual([
      ['-6', '-6', '6', '6'],
      ['-6', '6', '6', '-6'],
    ]);
    expect(halos.map(lineAttrs)).toEqual(markers.map(lineAttrs));
    const order = [...(holder?.children ?? [])].map((child) => child.getAttribute('class'));
    expect(order).toEqual(['atlas-viz-halo', 'atlas-viz-halo', 'atlas-viz-marker', 'atlas-viz-marker']);
    // The × is above the lines and below the points (viz/linear-fit.md 4.6).
    const marks = [...plot.querySelectorAll('svg.atlas-viz-svg > *')].map((el) =>
      el === holder ? 'mean' : (el.getAttribute('class') ?? ''),
    );
    expect(marks.indexOf('mean')).toBeGreaterThan(marks.lastIndexOf('atlas-viz-primary'));
    expect(marks.indexOf('mean')).toBeLessThan(marks.indexOf('atlas-viz-point'));
  });

  it('has a key of exactly 3 items: one apartment, the mean point (52.4, 10.92), the residual', () => {
    const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
    const items = [...parts(container).key().querySelectorAll(':scope > li')];
    expect(items).toHaveLength(3);
    const meanText = { x: formatNumber(MEAN.x, digits.meanX), y: formatNumber(MEAN.y, digits.meanY) };
    expect(meanText).toEqual({ x: '52.4', y: '10.92' });
    expect(items.map((item) => plainText(item))).toEqual([
      APARTMENTS.itemLabel.vi,
      formatString(VI.meanPoint, meanText),
      VI.residual,
    ]);
    expect(plainText(items[1])).toBe('Điểm trung bình (52.4, 10.92)');
    // Each item starts with a swatch drawn with the class of its mark: point, ×, residual.
    expect(items[0]?.querySelector('svg.atlas-viz-swatch circle.atlas-viz-point')).not.toBeNull();
    expect(items[1]?.querySelectorAll('svg.atlas-viz-swatch line.atlas-viz-marker')).toHaveLength(2);
    expect(items[2]?.querySelector('svg.atlas-viz-swatch line.atlas-viz-error')).not.toBeNull();
    for (const swatch of container.querySelectorAll('svg.atlas-viz-swatch')) {
      expect(swatch.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('names the plot (role img) and describes it: the dataset description, then the mean note', () => {
    const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
    const svg = parts(container).svg();
    expect(svg.getAttribute('aria-label')).toBe(
      'Biểu đồ phân tán 10 điểm dữ liệu, Giá thuê theo Diện tích, cùng đường thẳng bạn chọn.',
    );
    const describedBy = svg.getAttribute('aria-describedby') ?? '';
    expect(describedBy).not.toBe('');
    const description = document.getElementById(describedBy);
    expect(description).not.toBeNull();
    expect(container.contains(description)).toBe(true);
    expect(description?.classList.contains('sr-only')).toBe(true);
    const meanNote = formatString(VI.meanNote, { x: '52.4', y: '10.92' });
    expect(description?.textContent).toBe(`${APARTMENTS.description.vi} ${meanNote}`);
    // Axis titles and tick labels are text for the eye only.
    for (const selector of ['.atlas-viz-xticks', '.atlas-viz-yticks', '.atlas-viz-xtitle', '.atlas-viz-ytitle']) {
      expect(container.querySelector(selector)?.getAttribute('aria-hidden'), selector).toBe('true');
    }
  });

  it('says nothing in the live region after the page loads, however long it waits', () => {
    withFakeTimers(() => {
      const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
      wait(SETTLE_MS * 10);
      expect(parts(container).live().textContent).toBe('');
      expect(parts(container).live().classList.contains('sr-only')).toBe(true);
    });
  });
});

describe('LinearFitVizIsland: (c) (d) sliders and the live region', () => {
  it('(c) moving w redraws the line, the residuals and the MSE at once; the live region speaks at 600 ms, not 599', () => {
    withFakeTimers(() => {
      const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
      const ui = parts(container);
      const plot = ui.plot();
      const moved: Line = { w: 0.1, b: INITIAL.b };
      expect(lineAttrs(plot.querySelector('line.atlas-viz-primary'))).not.toEqual(expectedLine(moved));

      setSlider(ui.w(), '0.1');
      expect(ui.w().value).toBe('0.1');
      expect(ui.shown(ui.w())).toBe('0.1000');
      expect(ui.w().getAttribute('aria-valuetext')).toBe(formatString(VI.wValueText, { value: '0.1000', ...UNITS.vi }));
      expect(lineAttrs(plot.querySelector('line.atlas-viz-primary'))).toEqual(expectedLine(moved));
      expect([...plot.querySelectorAll('line.atlas-viz-error')].map(lineAttrs)).toEqual(expectedResiduals(moved));
      expect(ui.mseOf(0)).toBe(mseText(moved));
      expect(ui.mseOf(0)).toBe('MSE = 29.3140');
      expect(ui.equationOf(0)).toBe('= 0.1000 + 10.90');

      expect(ui.live().textContent).toBe('');
      wait(SETTLE_MS - 1);
      expect(ui.live().textContent).toBe('');
      wait(1);
      expect(ui.live().textContent).toBe(formatString(VI.announce, { mse: '29.3140' }));
    });
  });

  it('(d) five changes within 600 ms give one change of the live text, for the last value', () => {
    withFakeTimers(() => {
      const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
      const ui = parts(container);
      const live = ui.live();
      const records: MutationRecord[] = [];
      const observer = new MutationObserver((list) => records.push(...list));
      observer.observe(live, { childList: true, characterData: true, subtree: true });

      const steps: ['w' | 'b', string][] = [['w', '0.05'], ['w', '0.1'], ['w', '0.15'], ['w', '0.17'], ['b', '2']];
      steps.forEach(([slider, value], i) => {
        if (i > 0) wait(100);
        setSlider(ui[slider](), value);
      });
      wait(SETTLE_MS - 1);
      records.push(...observer.takeRecords());
      expect(records).toHaveLength(0);

      wait(1);
      wait(SETTLE_MS * 5);
      records.push(...observer.takeRecords());
      observer.disconnect();
      expect(records).toHaveLength(1);
      // The last position, w = 0.17, b = 2.0, is very close to the best line: the reading says so too.
      const last = formatString(VI.announce, { mse: formatNumber(mse(ROWS, NEAREST), digits.mse) });
      expect(live.textContent).toBe(`${last} ${VI.nearBest}`);
      expect(live.textContent).toBe('MSE của đường bạn chọn: 0.3617. Rất gần đường tốt nhất.');
    });
  });

  it('(e) a range value of 0.30000000000000004 is snapped: the input holds 0.3 and shows 0.3000', () => {
    const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    setSlider(ui.w(), '0.30000000000000004');
    expect(ui.w().value).toBe('0.3');
    expect(ui.shown(ui.w())).toBe(formatNumber(0.3, digits.w));
    expect(ui.shown(ui.w())).toBe('0.3000');
    expect(ui.w().getAttribute('aria-valuetext')).toBe(formatString(VI.wValueText, { value: '0.3000', ...UNITS.vi }));
    expect(ui.mseOf(0)).toBe(mseText({ w: 0.3, b: INITIAL.b }));

    // Off the grid: 0.1234 goes to the nearest step, 0.125 (formatNumber alone would show 0.1234).
    setSlider(ui.w(), '0.1234');
    expect(ui.w().value).toBe('0.125');
    expect(ui.shown(ui.w())).toBe('0.1250');
    expect(ui.mseOf(0)).toBe(mseText({ w: 0.125, b: INITIAL.b }));
  });

  it('b at its minimum −10.5 shows "−10.50" with U+2212, and the equation subtracts', () => {
    const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    setSlider(ui.w(), '0.4');
    setSlider(ui.b(), '-10.5');
    expect(ui.b().value).toBe('-10.5');
    expect(ui.shown(ui.b())).toBe(`${MINUS}10.50`);
    expect(ui.b().getAttribute('aria-valuetext')).toBe(`${MINUS}10.50 triệu đồng/tháng`);
    expect(ui.equationOf(0)).toBe(`= 0.4000 ${MINUS} 10.50`);
    expect(ui.mseOf(0)).toBe('MSE = 19.3340');
  });

  it('a line below the box is not drawn, and every residual still reaches the bottom edge', () => {
    const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    setSlider(ui.w(), '0');
    setSlider(ui.b(), '-5');
    const plot = ui.plot();
    expect(plot.querySelectorAll('line.atlas-viz-primary')).toHaveLength(0);
    const residuals = [...plot.querySelectorAll('line.atlas-viz-error')];
    expect(residuals).toHaveLength(N);
    expect(residuals.map((line) => line.getAttribute('y2'))).toEqual(ROWS.map(() => '100.00%'));
    // The MSE still uses the true line, not the clamped picture.
    expect(ui.mseOf(0)).toBe(mseText({ w: 0, b: -5 }));
  });
});

describe('LinearFitVizIsland: (f) "Show the best line"', () => {
  it('shows the best line, its row and the note, and speaks at once; a second press hides them and empties the live region', () => {
    withFakeTimers(() => {
      const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
      const ui = parts(container);
      const reference = () => ui.plot().querySelector('line.atlas-viz-reference');
      const bestNote = formatString(VI.bestNote, { mse: '0.3615' });
      const spoken = formatString(VI.announceBest, { w: '0.1695', b: '2.04', mse: '0.3615' });

      act(() => ui.toggle().click());
      expect(ui.toggle().getAttribute('aria-pressed')).toBe('true');
      expect(reference()?.hasAttribute('data-off')).toBe(false);
      expect(ui.readouts()[1]?.hasAttribute('data-off')).toBe(false);
      expect(ui.status().textContent).toBe(bestNote);
      // No timer: the reading is there right away.
      expect(ui.live().textContent).toBe(spoken);
      expect(spoken).toBe('Đường tốt nhất: w = 0.1695, b = 2.04, MSE = 0.3615.');

      act(() => ui.toggle().click());
      expect(ui.toggle().getAttribute('aria-pressed')).toBe('false');
      expect(reference()?.hasAttribute('data-off')).toBe(true);
      expect(ui.readouts()[1]?.hasAttribute('data-off')).toBe(true);
      expect(ui.status().textContent).toBe('');
      // Emptied (nothing new is said), so that pressing again changes the text and is spoken.
      expect(ui.live().textContent).toBe('');
      wait(SETTLE_MS * 5);
      expect(ui.live().textContent).toBe('');
      // The button's name never changes; aria-pressed carries the state.
      expect(ui.toggle().textContent).toBe(VI.showBest);
    });
  });

  it('on, off, on again: the live region gets a reading exactly twice, the same one each time', () => {
    withFakeTimers(() => {
      const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
      const ui = parts(container);
      const spoken = formatString(VI.announceBest, { w: '0.1695', b: '2.04', mse: '0.3615' });
      const live = ui.live();
      const records: MutationRecord[] = [];
      const observer = new MutationObserver((list) => records.push(...list));
      observer.observe(live, { childList: true, characterData: true, subtree: true });
      // The live text after each press, and how many times it changed (as in (d): one record per change).
      const texts: string[] = [];
      const press = () => {
        act(() => ui.toggle().click());
        wait(SETTLE_MS * 5);
        records.push(...observer.takeRecords());
        texts.push(live.textContent ?? '');
      };

      press();
      press();
      press();
      observer.disconnect();

      expect(ui.toggle().getAttribute('aria-pressed')).toBe('true');
      expect(texts).toEqual([spoken, '', spoken]);
      // Three changes: the reading, emptied, the reading again. Two of them give a screen reader something to say.
      expect(records).toHaveLength(3);
      expect(texts.filter((text) => text !== '')).toHaveLength(2);
    });
  });

  it('cancels a reading still waiting for the sliders to settle', () => {
    withFakeTimers(() => {
      const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
      const ui = parts(container);
      setSlider(ui.w(), '0.1');
      wait(SETTLE_MS / 2);
      act(() => ui.toggle().click());
      const spoken = formatString(VI.announceBest, { w: '0.1695', b: '2.04', mse: '0.3615' });
      expect(ui.live().textContent).toBe(spoken);
      wait(SETTLE_MS * 5);
      expect(ui.live().textContent).toBe(spoken);

      // A later move is spoken again.
      setSlider(ui.w(), '0.15');
      wait(SETTLE_MS);
      expect(ui.live().textContent).toBe(formatString(VI.announce, { mse: formatNumber(mse(ROWS, { w: 0.15, b: 10.9 }), 4) }));
    });
  });
});

describe('LinearFitVizIsland: (g) "very close to the best line"', () => {
  it('appears at the grid point nearest the least-squares line, w = 0.17, b = 2.0, and not before', () => {
    const { container } = render(<LinearFitVizIsland {...islandProps('vi')} />);
    const ui = parts(container);
    setSlider(ui.w(), '0.17');
    expect(container.querySelector('.atlas-viz-near')).toBeNull();
    setSlider(ui.b(), '2');
    const near = container.querySelectorAll('p.atlas-viz-near');
    expect(near).toHaveLength(1);
    expect(near[0]?.textContent).toBe(VI.nearBest);
    expect(near[0]?.querySelector('.atlas-check')?.getAttribute('aria-hidden')).toBe('true');
    expect(ui.mseOf(0)).toBe('MSE = 0.3617');

    // Both lines of the status at once: near, then the note of the best line.
    act(() => ui.toggle().click());
    expect([...ui.status().querySelectorAll(':scope > p')].map((p) => p.textContent)).toEqual([
      VI.nearBest,
      formatString(VI.bestNote, { mse: '0.3615' }),
    ]);

    // One step of b away is no longer "very close".
    setSlider(ui.b(), '2.5');
    expect(container.querySelector('.atlas-viz-near')).toBeNull();
  });
});

describe('LinearFitVizIsland: (h) no hard-coded text', () => {
  // Every string is "⟦key⟧" plus the placeholders of the real string, so formatString still fills them.
  const MARKED = Object.fromEntries(
    UI_KEYS.vizLinearFit.map((key) => {
      const placeholders = VI[key].match(/\{\{\w+\}\}/g) ?? [];
      return [key, [`⟦${key}⟧`, ...placeholders].join(' ')];
    }),
  ) as Strings;
  const props = islandProps('vi', MARKED);
  const fromProps = new Set([props.axes.x.title, props.axes.y.title, props.itemLabel]);
  const NUMBERS_AND_SYMBOLS = /^[0-9.=+−%() ]+$/;

  function badText(root: HTMLElement): string[] {
    const bad: string[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = (node.textContent ?? '').trim();
      if (!text || text.includes('⟦') || fromProps.has(text) || NUMBERS_AND_SYMBOLS.test(text)) continue;
      if (node.parentElement?.closest('.katex')) continue; // ŷ and x: KaTeX from props
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
      const { container } = render(<LinearFitVizIsland {...props} />);
      const ui = parts(container, MARKED);
      const seen = new Set<string>();
      const collect = () => {
        expect(badText(container)).toEqual([]);
        const all = container.innerHTML;
        for (const key of UI_KEYS.vizLinearFit) if (all.includes(`⟦${key}⟧`)) seen.add(key);
      };
      collect();
      // Near the best line, settled (announce + nearBest), then the best line on (bestNote, announceBest).
      setSlider(ui.w(), '0.17');
      setSlider(ui.b(), '2');
      wait(SETTLE_MS);
      collect();
      act(() => ui.toggle().click());
      collect();
      // Control: the check does see a string that is not from strings or props.
      const stray = document.createElement('span');
      stray.textContent = 'Kéo thử';
      ui.status().append(stray);
      expect(badText(container)).toEqual(['Kéo thử']);
      stray.remove();
      // Every one of the 18 strings reaches the reader somewhere.
      expect([...seen].sort()).toEqual([...UI_KEYS.vizLinearFit].sort());
    });
  });
});

describe('LinearFitVizIsland: (i) two islands on one page', () => {
  function checkIds(scope: HTMLElement, figures: number) {
    const ids = [...scope.querySelectorAll('[id]')].map((el) => el.id);
    expect(ids.length).toBe(figures * 3); // w, b and the description
    expect(new Set(ids).size).toBe(ids.length);
    for (const figure of scope.querySelectorAll('figure')) {
      // Every reference resolves inside its own island.
      const refs = [
        ...[...figure.querySelectorAll('label[for]')].map((label) => label.getAttribute('for') ?? ''),
        ...[...figure.querySelectorAll('[aria-describedby]')].map((el) => el.getAttribute('aria-describedby') ?? ''),
      ];
      expect(refs).toHaveLength(3);
      for (const ref of refs) expect(figure.contains(document.getElementById(ref)), ref).toBe(true);
    }
  }

  it('in one React tree: no id twice, and the two do not affect each other', () => {
    const { container } = render(
      <>
        <LinearFitVizIsland {...islandProps('vi')} />
        <LinearFitVizIsland {...islandProps('vi')} />
      </>,
    );
    checkIds(container, 2);
    const [first, second] = [...container.querySelectorAll('figure')] as HTMLElement[];
    setSlider(parts(first!).w(), '0.2');
    expect(parts(first!).shown(parts(first!).w())).toBe('0.2000');
    expect(parts(second!).shown(parts(second!).w())).toBe('0.0000');
    act(() => parts(second!).toggle().click());
    expect(parts(first!).toggle().getAttribute('aria-pressed')).toBe('false');
  });

  it('as two Astro islands (two roots, identifierPrefix r5 and r6), hydrated: no id twice', async () => {
    const hosts = ['r5', 'r6'].map((prefix) => {
      const host = document.createElement('div');
      host.innerHTML = renderToString(<LinearFitVizIsland {...islandProps('vi')} />, { identifierPrefix: prefix });
      document.body.append(host);
      return { host, prefix };
    });
    const roots: ReturnType<typeof hydrateRoot>[] = [];
    try {
      await act(async () => {
        for (const { host, prefix } of hosts) {
          roots.push(hydrateRoot(host, <LinearFitVizIsland {...islandProps('vi')} />, { identifierPrefix: prefix }));
        }
      });
      checkIds(document.body, 2);
    } finally {
      act(() => roots.forEach((root) => root.unmount()));
      hosts.forEach(({ host }) => host.remove());
    }
  });
});

describe('LinearFitVizIsland: en strings', () => {
  it('uses the strings and units it is given (en page)', () => {
    const { container } = render(<LinearFitVizIsland {...islandProps('en')} />);
    const ui = parts(container, EN);
    expect(ui.toggle().textContent).toBe('Show the best line');
    expect(ui.controls()).toBeTruthy();
    expect(plainText(ui.key().querySelectorAll('li')[1])).toBe('Mean point (52.4, 10.92)');
    expect(ui.w().getAttribute('aria-valuetext')).toBe('0.0000 million VND/month per m²');
    expect(ui.svg().getAttribute('aria-label')).toBe(
      'Scatter plot of 10 data points, Rent against Floor area, with the line you chose.',
    );
    expect(container.querySelector('figcaption')?.textContent).toBe(EN.caption);
    expect(container.querySelector('.atlas-viz-xtitle')?.textContent).toBe('Floor area (m²)');
  });
});
