// @vitest-environment jsdom
// GradientFlowVizIsland (docs/architecture/viz/gradient-flow.md; viz/README.md sections 2.7, 2.8). Props are built
// the way GradientFlowViz.astro builds them: the real strings and KaTeX. Controls are found by role and name.
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GradientFlowVizIsland, {
  type GradientFlowVizIslandProps,
} from '../../../src/components/viz/gradient-flow-viz/GradientFlowVizIsland';
import { SETTLE_MS } from '../../../src/components/viz/kit/use-settled';
import { formatString } from '../../../src/i18n/format';
import { UI_KEYS, type UiStrings } from '../../../src/i18n/ui';
import { inlineMarkupLabel, renderInlineMarkup } from '../../../src/lib/inline-markup';
import { GRADIENT_FLOW } from '../../../src/lib/viz/gradient-flow';
// Imported rather than read from disk: under jsdom, import.meta.url is not a file: URL.
import enJson from '../../../src/content/i18n/en.json';
import viJson from '../../../src/content/i18n/vi.json';

type Locale = 'vi' | 'en';
type Strings = UiStrings<'vizGradientFlow'>;

function vizStrings(locale: Locale): Strings {
  const all: Record<string, string> = locale === 'vi' ? viJson : enJson;
  const entries = UI_KEYS.vizGradientFlow.map((key) => {
    const value = all[`atlas.vizGradientFlow.${key}`];
    if (!value) throw new Error(`missing atlas.vizGradientFlow.${key} in ${locale}.json`);
    return [key, value] as const;
  });
  return Object.fromEntries(entries) as Strings;
}

function islandProps(locale: Locale): GradientFlowVizIslandProps {
  const strings = vizStrings(locale);
  return {
    captionHtml: renderInlineMarkup(
      formatString(strings.caption, { width: GRADIENT_FLOW.width, batch: GRADIENT_FLOW.batch }),
    ),
    stdHtml: {
      std1: renderInlineMarkup('$1$'),
      xavier: renderInlineMarkup(String.raw`$\sqrt{1/n}$`),
      he: renderInlineMarkup(String.raw`$\sqrt{2/n}$`),
    },
    labels: { depthHtml: renderInlineMarkup(strings.depthLabel), depthText: inlineMarkupLabel(strings.depthLabel) },
    strings,
  };
}

const VI = vizStrings('vi');
const barCount = (root: HTMLElement) => root.querySelectorAll('svg[role="img"] line.atlas-viz-bar').length;
const shownRegime = (root: HTMLElement) =>
  [...root.querySelectorAll('.atlas-viz-status > p')].filter((p) => !p.hasAttribute('data-off')).map((p) => p.textContent);

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('GradientFlowVizIsland', () => {
  it('renders sigmoid + Xavier with 10 layers: 9 bars, a ring for the last layer, "vanishing"', () => {
    const { container } = render(<GradientFlowVizIsland {...islandProps('vi')} />);
    // Each of the 9 bars has a full line and a 2px stub line.
    expect(barCount(container)).toBe(18);
    expect(container.querySelectorAll('svg[role="img"] circle.atlas-viz-zero')).toHaveLength(1);
    expect(shownRegime(container)).toEqual([expect.stringContaining(VI.vanishing)]);
    expect(container.textContent).toContain('2.0 × 10⁻⁶');
  });

  it('hydrates the build HTML without a mismatch', async () => {
    const html = renderToString(<GradientFlowVizIsland {...islandProps('en')} />);
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.append(host);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverable: unknown[] = [];
    await act(async () => {
      hydrateRoot(host, <GradientFlowVizIsland {...islandProps('en')} />, {
        onRecoverableError: (error) => recoverable.push(error),
      });
    });
    expect(recoverable).toEqual([]);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
    host.remove();
  });

  it('ReLU + standard deviation 1 explodes, ReLU + He is stable; a button speaks at once', () => {
    const { container, getByRole } = render(<GradientFlowVizIsland {...islandProps('vi')} />);
    const live = container.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(live.textContent).toBe('');
    fireEvent.click(getByRole('button', { name: VI.relu }));
    expect(getByRole('button', { name: VI.relu }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(getByRole('button', { name: VI.std1 }));
    expect(shownRegime(container)).toEqual([expect.stringContaining(VI.exploding)]);
    expect(live.textContent).toContain(VI.exploding);
    fireEvent.click(getByRole('button', { name: VI.he }));
    expect(shownRegime(container)).toEqual([expect.stringContaining(VI.stable)]);
    expect(live.textContent).toContain(VI.stable);
  });

  it('the slider changes the number of bars, and speaks once it has settled', () => {
    vi.useFakeTimers();
    const { container, getByRole } = render(<GradientFlowVizIsland {...islandProps('vi')} />);
    const group = getByRole('group', { name: VI.controls });
    const slider = within(group).getByRole('slider', { name: VI.depthLabel });
    expect(slider.getAttribute('aria-valuetext')).toBe(formatString(VI.depthValueText, { value: 10 }));
    fireEvent.change(slider, { target: { value: '20' } });
    expect(barCount(container)).toBe(38);
    const live = container.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(live.textContent).toBe('');
    act(() => {
      vi.advanceTimersByTime(SETTLE_MS);
    });
    expect(live.textContent).toContain('20');
    expect(live.textContent).toContain(VI.vanishing);
  });
});
