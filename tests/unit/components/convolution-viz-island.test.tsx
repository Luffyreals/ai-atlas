// @vitest-environment jsdom
// ConvolutionVizIsland (docs/architecture/viz/convolution.md; viz/README.md sections 2.7, 2.8).
// Strings are the real vi/en ones; controls are found by role and accessible name.
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ConvolutionVizIsland from '../../../src/components/viz/convolution-viz/ConvolutionVizIsland';
import { formatString } from '../../../src/i18n/format';
import { UI_KEYS, type UiStrings } from '../../../src/i18n/ui';
import { CONV_IMAGE, CONV_KERNELS, crossCorrelate } from '../../../src/lib/viz/convolution';
import { formatNumber } from '../../../src/lib/viz/format';
// Imported rather than read from disk: under jsdom, import.meta.url is not a file: URL.
import enJson from '../../../src/content/i18n/en.json';
import viJson from '../../../src/content/i18n/vi.json';

type Strings = UiStrings<'vizConvolution'>;

function vizStrings(all: Record<string, string>): Strings {
  return Object.fromEntries(
    UI_KEYS.vizConvolution.map((key) => {
      const value = all[`atlas.vizConvolution.${key}`];
      if (!value) throw new Error(`missing atlas.vizConvolution.${key}`);
      return [key, value];
    }),
  ) as Strings;
}

const VI = vizStrings(viJson);
const EN = vizStrings(enJson);

afterEach(cleanup);

function setup(strings: Strings = VI) {
  const { container } = render(<ConvolutionVizIsland strings={strings} />);
  const scope = within(container);
  const cells = () => container.querySelectorAll<HTMLElement>('[role="gridcell"]');
  const chosen = () => container.querySelector<HTMLElement>('[role="gridcell"][aria-selected="true"]');
  const sum = () => container.querySelector('.atlas-viz-context p')?.textContent;
  const live = () => container.querySelector('[aria-live="polite"]')?.textContent;
  return { container, scope, cells, chosen, sum, live };
}

describe('ConvolutionVizIsland', () => {
  it('opens on Sobel vertical at (1, 1): sum 27, a 6 x 6 map with the NumPy numbers', () => {
    const { scope, cells, chosen, sum } = setup();
    expect(scope.getByRole('button', { name: VI.sobelVertical }).getAttribute('aria-pressed')).toBe('true');
    expect(cells()).toHaveLength(36);
    expect(chosen()?.getAttribute('aria-label')).toBe(formatString(VI.cellLabel, { row: 1, col: 1, value: '27' }));
    expect(sum()).toBe(formatString(VI.sum, { value: '27' }));
    const map = crossCorrelate(CONV_IMAGE, CONV_KERNELS.sobelVertical.weights);
    expect([...cells()].map((c) => c.textContent)).toEqual(map.flat().map((v) => formatNumber(v, 0)));
    expect(cells()[17]?.textContent).toBe('−36'); // row 2, column 5: U+2212
  });

  it('one tab stop in the grid; arrow keys move the window and the focus, clamped at the edges', () => {
    const { cells, chosen, sum } = setup();
    expect([...cells()].filter((c) => c.tabIndex === 0)).toHaveLength(1);
    chosen()!.focus();
    fireEvent.keyDown(chosen()!, { key: 'ArrowDown' });
    expect(chosen()?.getAttribute('aria-label')).toBe(formatString(VI.cellLabel, { row: 2, col: 1, value: '36' }));
    expect(document.activeElement).toBe(chosen());
    expect(sum()).toBe(formatString(VI.sum, { value: '36' }));
    fireEvent.keyDown(chosen()!, { key: 'Home', ctrlKey: true });
    fireEvent.keyDown(chosen()!, { key: 'ArrowUp' });
    fireEvent.keyDown(chosen()!, { key: 'ArrowLeft' });
    expect(chosen()?.getAttribute('aria-label')).toBe(formatString(VI.cellLabel, { row: 0, col: 0, value: '9' }));
    fireEvent.keyDown(chosen()!, { key: 'End', ctrlKey: true });
    expect(chosen()?.getAttribute('aria-label')).toBe(formatString(VI.cellLabel, { row: 5, col: 5, value: '−9' }));
  });

  it('a click on a cell moves the window there; previous/next step in reading order and wrap', () => {
    const { scope, cells, chosen, live } = setup();
    fireEvent.click(cells()[0]!);
    expect(chosen()).toBe(cells()[0]);
    fireEvent.click(scope.getByRole('button', { name: VI.prev }));
    expect(chosen()).toBe(cells()[35]);
    expect(live()).toBe(formatString(VI.announce, { name: VI.sobelVertical, row: 5, col: 5, value: '−9' }));
    fireEvent.click(scope.getByRole('button', { name: VI.next }));
    expect(chosen()).toBe(cells()[0]);
  });

  it('a kernel button redraws the map, the products and the note, and speaks once', () => {
    const { scope, container, cells, sum, live } = setup(EN);
    expect(live()).toBe('');
    fireEvent.click(scope.getByRole('button', { name: EN.blur }));
    expect(scope.getByRole('button', { name: EN.blur }).getAttribute('aria-pressed')).toBe('true');
    expect(cells()[0]?.textContent).toBe('1.00');
    expect(sum()).toBe(formatString(EN.sum, { value: '4.00' }));
    expect(container.textContent).toContain('9 × 1/9');
    expect(live()).toBe(formatString(EN.announce, { name: EN.blur, row: 1, col: 1, value: '4.00' }));
    const notes = [...container.querySelectorAll('.atlas-viz-status p')];
    expect(notes.filter((p) => !p.hasAttribute('data-off')).map((p) => p.textContent)).toEqual([EN.blurNote]);
    fireEvent.click(scope.getByRole('button', { name: EN.sharpen }));
    expect(container.textContent).toContain('9 × (−1)');
  });

  it('the image tells where the window is', () => {
    const { container, cells } = setup();
    const image = container.querySelector('[role="img"]');
    expect(image?.getAttribute('aria-label')).toBe(formatString(VI.imageLabel, { r0: 1, r1: 3, c0: 1, c1: 3 }));
    fireEvent.click(cells()[35]!);
    expect(image?.getAttribute('aria-label')).toBe(formatString(VI.imageLabel, { r0: 5, r1: 7, c0: 5, c1: 7 }));
  });

  it('build HTML: buttons disabled, no tab stop; hydrates with no warning and then enables them', async () => {
    const html = renderToString(<ConvolutionVizIsland strings={VI} />);
    const host = document.createElement('div');
    host.innerHTML = html;
    expect(host.querySelectorAll('button:disabled')).toHaveLength(7);
    expect(host.querySelectorAll('[tabindex]')).toHaveLength(0);
    document.body.append(host);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      hydrateRoot(host, <ConvolutionVizIsland strings={VI} />);
    });
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
    expect(host.querySelectorAll('button:disabled')).toHaveLength(0);
    expect(host.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    host.remove();
  });
});
