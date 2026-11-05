// ConvolutionViz (docs/architecture/cv-lessons.md, section 1.1). One idea: a 3 × 3 kernel slides over the image, and
// each position gives ONE number, the sum of the 9 products cell by cell; another kernel finds another feature.
// Four kernel buttons (aria-pressed) and one slider over the 36 output cells in reading order. The window on the
// image and its cell on the feature map are framed; below, the kernel and the 9 products, row by row.
// Cross-correlation (no kernel flip), as in PyTorch: see convolution.ts. Every string arrives through props.
import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react';
import { formatString } from '../../../i18n/format';
import type { UiStrings } from '../../../i18n/ui';
import {
  KERNELS,
  cellOf,
  cellShade,
  crossCorrelate,
  getKernel,
  maxAbs,
  sumTerms,
  weightInProduct,
  windowTerms,
  type Grid,
  type KernelId,
} from '../../../lib/viz/convolution';
import { formatNumber } from '../../../lib/viz/format';
import type { SliderSpec } from '../../../lib/viz/linear-fit';
import PixelGrid, { CellFrame, type PixelCell } from '../kit/PixelGrid';
import { useHydrated } from '../kit/use-hydrated';
import { useSettled } from '../kit/use-settled';
import VizSlider from '../kit/VizSlider';

export interface ConvolutionVizIslandProps {
  image: Grid; // DIGIT_FOUR_8.pixels, values 0–1
  description: string; // DIGIT_FOUR_8.description[locale]
  config: { kernel: KernelId; position: SliderSpec };
  labels: {
    imageTitleHtml: string; // KaTeX HTML (renderInlineMarkup) of strings.imageTitle
    kernelTitleHtml: string;
    positionHtml: string; // the slider label
  };
  strings: UiStrings<'vizConvolution'>;
}

const K = 3; // kernel side
const PIXEL_DIGITS = 1; // image values have one decimal

export default function ConvolutionVizIsland({ image, description, config, labels, strings }: ConvolutionVizIslandProps) {
  const uid = useId();
  const hydrated = useHydrated();
  const [kernelId, setKernelId] = useState<KernelId>(config.kernel);
  const [position, setPosition] = useState<number>(config.position.initial);
  const [live, setLive] = useState('');

  const n = image.length;
  const outSide = n - K + 1;
  const kernel = getKernel(kernelId);
  const map = useMemo(() => crossCorrelate(image, kernel.weights), [image, kernel]);
  const scale = useMemo(() => maxAbs(map), [map]);
  const { i, j } = cellOf(position, outSide);
  const terms = windowTerms(image, kernel.weights, i, j);
  const value = sumTerms(terms);
  const valueText = formatNumber(value, kernel.digits);
  const kernelName = strings[kernelId];
  const where = formatString(strings.position, { i, j });

  const imageCells: PixelCell[][] = image.map((row) => row.map((v) => ({ opacity: cellShade(v, false, 1).opacity })));
  const mapCells: PixelCell[][] = map.map((row) => row.map((v) => cellShade(v, kernel.diverging, scale)));

  // The live region speaks once the slider has stayed put (one reading per drag); a kernel button speaks at once.
  const settled = useSettled(position);
  useEffect(() => {
    if (settled === undefined) return;
    setLive(formatString(strings.announce, { i, j, value: valueText }));
  }, [settled]);

  const chooseKernel = (id: KernelId) => {
    setKernelId(id);
    const next = getKernel(id);
    const v = formatNumber(sumTerms(windowTerms(image, next.weights, i, j)), next.digits);
    setLive(formatString(strings.announceKernel, { kernel: strings[id], i, j, value: v }));
  };

  // The 9 products in three rows, as the window lies on the image: "1.0×(−1)".
  const productRows = [0, 1, 2].map((u) =>
    terms
      .filter((t) => t.u === u)
      .map((t) => `${formatNumber(t.x, PIXEL_DIGITS)}×${weightInProduct(kernel.labels[t.u]?.[t.v] ?? '')}`),
  );
  const kernelRows = kernel.labels.map((row) => row.join(', ')).join('; ');
  const ids = { pos: `${uid}-pos`, desc: `${uid}-desc` };
  const panels = { '--atlas-viz-cols': 2 } as CSSProperties;

  return (
    <figure className="atlas-viz-figure">
      <figcaption className="atlas-viz-caption">{strings.caption}</figcaption>

      <div className="atlas-viz-choice" role="group" aria-label={strings.kernelGroup}>
        {KERNELS.map((k) => (
          <button
            key={k.id}
            type="button"
            className="atlas-viz-toggle"
            aria-pressed={kernelId === k.id}
            disabled={!hydrated}
            onClick={() => chooseKernel(k.id)}
          >
            {strings[k.id]}
          </button>
        ))}
      </div>

      <div className="atlas-viz-panels" style={panels}>
        <div>
          {/* Build-time HTML from renderInlineMarkup (escaped text plus KaTeX), never reader input. */}
          <div className="atlas-viz-axis-title" dangerouslySetInnerHTML={{ __html: labels.imageTitleHtml }} />
          <PixelGrid
            rows={n}
            cols={n}
            cells={imageCells}
            gridLines
            label={formatString(strings.imageLabel, { r0: i, r1: i + K - 1, c0: j, c1: j + K - 1 })}
            describedBy={ids.desc}
          >
            <CellFrame x={j} y={i} size={K} />
          </PixelGrid>
        </div>
        <div>
          <div className="atlas-viz-axis-title">{strings.mapTitle}</div>
          {/* The 6 × 6 map sits inside an 8 × 8 frame, one cell in: each output cell lies under the middle of its
              window, and the empty ring shows what padding 0 loses. */}
          <PixelGrid
            rows={n}
            cols={n}
            cells={mapCells}
            offset={(n - outSide) / 2}
            gridLines
            label={formatString(strings.mapLabel, { kernel: kernelName, i, j, value: valueText })}
          >
            <rect
              className="atlas-viz-axis"
              x={(n - outSide) / 2}
              y={(n - outSide) / 2}
              width={outSide}
              height={outSide}
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <CellFrame x={j + (n - outSide) / 2} y={i + (n - outSide) / 2} size={1} />
          </PixelGrid>
        </div>
      </div>

      {/* Both keys always in the DOM, stacked in one cell: switching kernels does not move what is below. */}
      <div className="atlas-viz-status-stack">
        <p className="atlas-viz-key" data-off={kernel.diverging ? '' : undefined}>
          {strings.shadeKey}
        </p>
        <ul className="atlas-viz-key" data-off={kernel.diverging ? undefined : ''}>
          <li>
            <svg className="atlas-viz-swatch" aria-hidden="true" focusable="false">
              <rect className="atlas-viz-px" data-sign="+" x="4" y="25%" width="16" height="50%" />
            </svg>
            {strings.positive}
          </li>
          <li>
            <svg className="atlas-viz-swatch" aria-hidden="true" focusable="false">
              <rect className="atlas-viz-px" data-sign="-" x="4" y="25%" width="16" height="50%" />
            </svg>
            {strings.negative}
          </li>
        </ul>
      </div>

      <div className="atlas-viz-controls" role="group" aria-label={strings.controls}>
        <VizSlider
          id={ids.pos}
          labelHtml={labels.positionHtml}
          ariaLabel={strings.positionLabel}
          spec={config.position}
          value={position}
          display={where}
          valueText={where}
          disabled={!hydrated}
          onChange={setPosition}
        />
      </div>

      <div className="atlas-viz-sum">
        <div className="atlas-viz-context">
          <span className="atlas-viz-axis-title" dangerouslySetInnerHTML={{ __html: labels.kernelTitleHtml }} />
          <div className="atlas-viz-matrix" aria-hidden="true">
            {kernel.labels.flat().map((label, k) => (
              <span key={k}>{label}</span>
            ))}
          </div>
          <span className="sr-only">{formatString(strings.kernelText, { kernel: kernelName, rows: kernelRows })}</span>
        </div>
        <div className="atlas-viz-context">
          <span className="atlas-viz-axis-title">{strings.sumTitle}</span>
          <div>
            {productRows.map((row, u) => (
              <p key={u}>
                {/* Figure spaces under the first row's missing "+ ", so the three rows line up. */}
                <span className="atlas-viz-num">{u === 0 ? '  ' : '+ '}</span>
                {row.map((term, v) => (
                  <span key={v}>
                    {v > 0 && ' + '}
                    <span className="atlas-viz-num">{term}</span>
                  </span>
                ))}
              </p>
            ))}
            <p className="atlas-viz-num">
              = <strong>{valueText}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="atlas-viz-status atlas-viz-status-stack">
        {KERNELS.map((k) => (
          <p key={k.id} data-off={k.id === kernelId ? undefined : ''}>
            {strings[`${k.id}Note` as const]}
          </p>
        ))}
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
