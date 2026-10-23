// One slider of a VIZ (docs/architecture/viz.md, sections 2.7, 4.3): a visible label (KaTeX allowed), the value
// next to it, and a native range input below, so arrows, PageUp/PageDown and Home/End come from the browser.
import type { ChangeEvent } from 'react';
import { snapToStep, type SliderSpec } from '../../../lib/viz/linear-fit';

export interface VizSliderProps {
  id: string; // from useId()
  labelHtml: string; // renderInlineMarkup output (trusted: build time, repo content)
  ariaLabel: string; // inlineMarkupLabel output: Chrome leaves KaTeX's MathML out of names (decision 12)
  spec: SliderSpec;
  value: number;
  display: string; // formatted value next to the label, aria-hidden (aria-valuetext says it)
  valueText: string; // aria-valuetext
  disabled: boolean; // !useHydrated()
  onChange: (value: number) => void; // already snapped with snapToStep
}

export default function VizSlider({
  id,
  labelHtml,
  ariaLabel,
  spec,
  value,
  display,
  valueText,
  disabled,
  onChange,
}: VizSliderProps) {
  const change = (event: ChangeEvent<HTMLInputElement>) =>
    onChange(snapToStep(Number(event.currentTarget.value), spec));
  return (
    // A plain wrapper: one cell of the .atlas-viz-controls grid, so the label row sits right on its input.
    <div>
      <div className="atlas-viz-control-head">
        {/* Build-time HTML from renderInlineMarkup (escaped text plus KaTeX), never reader input. */}
        <label htmlFor={id} dangerouslySetInnerHTML={{ __html: labelHtml }} />
        {/* Not <output>: its status role would speak on every step. aria-valuetext says the value. */}
        <span className="atlas-viz-num" aria-hidden="true">
          {display}
        </span>
      </div>
      <input
        id={id}
        className="atlas-viz-slider"
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={value}
        aria-label={ariaLabel}
        aria-valuetext={valueText}
        disabled={disabled}
        onChange={change}
      />
    </div>
  );
}
