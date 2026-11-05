// ConvolutionViz (docs/architecture/viz/convolution.md). One idea: each cell of the feature map is the sum of
// the 9 products of the 3 x 3 kernel with the 3 x 3 window of the image right under it; the same kernel slides
// over the whole image, and changing the kernel changes what the map picks out (edges, blur, sharpening).
// Five kernel buttons; the window moves by pressing a cell of the feature map (a grid with one tab stop and
// arrow keys) or the previous/next buttons. No animation. Every string arrives through props
// (ConvolutionViz.astro); the image and kernels come from src/lib/viz/convolution.ts, the same file the tests
// read. Numbers by formatNumber (toFixed), positions by pct(), so the first render matches the build HTML.
import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { formatString } from '../../../i18n/format';
import type { UiStrings } from '../../../i18n/ui';
import {
  CONV_IMAGE,
  CONV_KERNELS,
  CONV_START,
  KERNEL_IDS,
  crossCorrelate,
  isBright,
  maxAbs,
  productsAt,
  signedFill,
  valueAt,
  windowAt,
  type ConvKernel,
  type KernelId,
  type Matrix,
} from '../../../lib/viz/convolution';
import { formatNumber } from '../../../lib/viz/format';
import { pct } from '../../../lib/viz/scale';
import { useHydrated } from '../kit/use-hydrated';

export interface ConvolutionVizIslandProps {
  strings: UiStrings<'vizConvolution'>;
}

const NOTE_KEYS = {
  identity: 'identityNote',
  blur: 'blurNote',
  sharpen: 'sharpenNote',
  sobelVertical: 'sobelVerticalNote',
  sobelHorizontal: 'sobelHorizontalNote',
} as const satisfies Record<KernelId, keyof UiStrings<'vizConvolution'>>;

/** How a kernel weight is written: "1/9" for the blur, else the number. */
function weightText(kernel: ConvKernel, w: number): string {
  return kernel.weightLabel ?? formatNumber(w, 0);
}

/** A weight inside a product: a negative one in brackets, "9 × (−1)". */
function factorText(kernel: ConvKernel, w: number): string {
  const text = weightText(kernel, w);
  return w < 0 ? `(${text})` : text;
}

/** The 3 x 3 window (or the chosen cell) drawn over a grid of n x n cells: accent frame with a background halo. */
function Frame({ row, col, size, n }: { row: number; col: number; size: number; n: number }) {
  return (
    <span
      className="atlas-viz-frame"
      aria-hidden="true"
      style={{ top: pct((row / n) * 100), left: pct((col / n) * 100), width: pct((size / n) * 100), height: pct((size / n) * 100) }}
    />
  );
}

/** Style of a cell with a signed fill: its opacity rides on a custom property read by viz.css. */
function fillProps(value: number, scale: number) {
  const fill = signedFill(value, scale);
  return fill
    ? { 'data-fill': fill.sign, style: { '--atlas-viz-o': fill.opacity } as CSSProperties }
    : {};
}

export default function ConvolutionVizIsland({ strings }: ConvolutionVizIslandProps) {
  // Unique per island and the same at build time and in the browser (components.md 2.9). Only for id/aria-*.
  const uid = useId();
  const hydrated = useHydrated();
  const [kernelId, setKernelId] = useState<KernelId>(CONV_START.kernel);
  const [pos, setPos] = useState({ row: CONV_START.row, col: CONV_START.col });
  const [live, setLive] = useState('');
  const cells = useRef<(HTMLDivElement | null)[]>([]);

  const kernel = CONV_KERNELS[kernelId];
  const K: Matrix = kernel.weights;
  const map = useMemo(() => crossCorrelate(CONV_IMAGE, K), [K]);
  const n = map.length; // 6
  const cols = map[0]?.length ?? 0;
  const k = K.length; // 3
  const scale = useMemo(() => maxAbs(map), [map]);
  const windowValues = windowAt(CONV_IMAGE, K, pos.row, pos.col);
  const products = productsAt(CONV_IMAGE, K, pos.row, pos.col);
  const productScale = Math.max(maxAbs(products), scale);
  const sum = valueAt(CONV_IMAGE, K, pos.row, pos.col);
  const num = (v: number) => formatNumber(v, kernel.digits);
  const name = strings[kernelId];
  const announce = (id: KernelId, row: number, col: number) =>
    formatString(strings.announce, {
      name: strings[id],
      row,
      col,
      value: formatNumber(valueAt(CONV_IMAGE, CONV_KERNELS[id].weights, row, col), CONV_KERNELS[id].digits),
    });

  const chooseKernel = (id: KernelId) => {
    setKernelId(id);
    setLive(announce(id, pos.row, pos.col));
  };

  /** Moves the window; `focus` moves the grid's focus with it (keyboard in the grid). */
  const moveTo = (row: number, col: number, focus = false) => {
    setPos({ row, col });
    if (focus) cells.current[row * cols + col]?.focus();
  };

  const step = (delta: 1 | -1) => {
    const total = n * cols;
    const index = (pos.row * cols + pos.col + delta + total) % total;
    const row = Math.floor(index / cols);
    const col = index % cols;
    moveTo(row, col);
    setLive(announce(kernelId, row, col));
  };

  const onGridKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const { row, col } = pos;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [Math.max(row - 1, 0), col],
      ArrowDown: [Math.min(row + 1, n - 1), col],
      ArrowLeft: [row, Math.max(col - 1, 0)],
      ArrowRight: [row, Math.min(col + 1, cols - 1)],
      Home: event.ctrlKey ? [0, 0] : [row, 0],
      End: event.ctrlKey ? [n - 1, cols - 1] : [row, cols - 1],
    };
    const next = moves[event.key];
    if (!next) return;
    event.preventDefault();
    moveTo(next[0], next[1], true);
  };

  const r1 = pos.row + k - 1;
  const c1 = pos.col + k - 1;
  const ids = { image: `${uid}-image` };
  const kernelRows = K.map((row) => row.map((w) => weightText(kernel, w)).join(', ')).join('; ');

  return (
    <figure className="atlas-viz-figure">
      <figcaption className="atlas-viz-caption">{strings.caption}</figcaption>

      <div className="atlas-viz-choice" role="group" aria-label={strings.kernelsLabel}>
        {KERNEL_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className="atlas-viz-toggle"
            aria-pressed={id === kernelId}
            disabled={!hydrated}
            onClick={() => chooseKernel(id)}
          >
            {strings[id]}
          </button>
        ))}
      </div>

      <div className="atlas-viz-panels">
        <div className="atlas-viz-panel">
          <span className="atlas-viz-axis-title" aria-hidden="true">
            {strings.imageTitle}
          </span>
          <div
            className="atlas-viz-cells"
            style={{ '--atlas-viz-n': CONV_IMAGE[0]?.length ?? 0 } as CSSProperties}
            role="img"
            aria-label={formatString(strings.imageLabel, { r0: pos.row, r1, c0: pos.col, c1 })}
            aria-describedby={ids.image}
          >
            {CONV_IMAGE.flatMap((row, i) =>
              row.map((v, j) => (
                <span key={`${i}-${j}`} className="atlas-viz-cell" data-bright={isBright(v) ? '' : undefined}>
                  {formatNumber(v, 0)}
                </span>
              )),
            )}
            <Frame row={pos.row} col={pos.col} size={k} n={CONV_IMAGE.length} />
          </div>
        </div>

        <div className="atlas-viz-panel atlas-viz-calc">
          <div className="atlas-viz-panel">
            <span className="atlas-viz-axis-title" aria-hidden="true">
              {formatString(strings.kernelTitle, { name })}
            </span>
            <div
              className="atlas-viz-cells"
              style={{ '--atlas-viz-n': k, width: '9rem' } as CSSProperties}
              role="img"
              aria-label={formatString(strings.kernelLabel, { name, rows: kernelRows })}
            >
              {K.flatMap((row, u) =>
                row.map((w, v) => (
                  <span key={`${u}-${v}`} className="atlas-viz-cell" {...fillProps(w, maxAbs(K))}>
                    <span>{weightText(kernel, w)}</span>
                  </span>
                )),
              )}
            </div>
          </div>
          <div className="atlas-viz-panel">
            <span className="atlas-viz-axis-title">{strings.productsTitle}</span>
            <div className="atlas-viz-cells" style={{ '--atlas-viz-n': k, width: '16rem' } as CSSProperties}>
              {products.flatMap((row, u) =>
                row.map((p, v) => (
                  <span
                    key={`${u}-${v}`}
                    className="atlas-viz-cell"
                    data-zero={p === 0 ? '' : undefined}
                    {...fillProps(p, productScale)}
                  >
                    <span>
                      {formatString(strings.product, {
                        x: formatNumber(windowValues[u]?.[v] ?? 0, 0),
                        w: factorText(kernel, K[u]?.[v] ?? 0),
                      })}
                      <br />= {num(p)}
                    </span>
                  </span>
                )),
              )}
            </div>
          </div>
          <div className="atlas-viz-context" style={{ flexBasis: '100%' }}>
            <p>{formatString(strings.sum, { value: num(sum) })}</p>
          </div>
        </div>

        <div className="atlas-viz-panel">
          <span className="atlas-viz-axis-title" aria-hidden="true">
            {strings.mapTitle}
          </span>
          <div className="atlas-viz-choice">
            <button type="button" className="atlas-viz-toggle" disabled={!hydrated} onClick={() => step(-1)}>
              {strings.prev}
            </button>
            <button type="button" className="atlas-viz-toggle" disabled={!hydrated} onClick={() => step(1)}>
              {strings.next}
            </button>
          </div>
          <div
            className="atlas-viz-cells"
            style={{ '--atlas-viz-n': cols } as CSSProperties}
            role="grid"
            aria-label={formatString(strings.mapLabel, { name })}
          >
            {map.map((row, i) => (
              <div key={i} role="row" style={{ display: 'contents' }}>
                {row.map((v, j) => {
                  const chosen = i === pos.row && j === pos.col;
                  return (
                    <div
                      key={j}
                      ref={(el) => {
                        cells.current[i * cols + j] = el;
                      }}
                      role="gridcell"
                      className="atlas-viz-cell"
                      aria-selected={chosen}
                      aria-label={formatString(strings.cellLabel, { row: i, col: j, value: num(v) })}
                      tabIndex={hydrated ? (chosen ? 0 : -1) : undefined}
                      onClick={() => moveTo(i, j)}
                      onKeyDown={onGridKey}
                      {...fillProps(v, scale)}
                    >
                      <span aria-hidden="true">{num(v)}</span>
                    </div>
                  );
                })}
              </div>
            ))}
            <Frame row={pos.row} col={pos.col} size={1} n={n} />
          </div>
          <p className="atlas-viz-key">{strings.legend}</p>
        </div>
      </div>

      <div className="atlas-viz-status atlas-viz-status-stack">
        {KERNEL_IDS.map((id) => (
          <p key={id} data-off={id === kernelId ? undefined : ''}>
            {strings[NOTE_KEYS[id]]}
          </p>
        ))}
      </div>

      <p className="sr-only" id={ids.image}>
        {strings.imageDesc}
      </p>
      {/* Present and empty from the start; only its text changes, so screen readers speak it. */}
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </figure>
  );
}
