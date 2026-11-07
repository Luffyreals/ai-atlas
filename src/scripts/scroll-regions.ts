// Keyboard access to the lesson's sideways-scrolling boxes (docs/architecture/launch.md, section 3.6.1; axe
// scrollable-region-focusable). A display formula or a table that is wider than its box gets tabindex="0",
// so Tab can stop on it and the arrow keys scroll it; one that fits gets nothing, so it adds no tab stop.
// Same idea as Expressive Code does for <pre>. Loaded on every page by the Head override.
// No role="region" is added: that would raise axe landmark-unique. The boxes already have a name or a role
// (.katex-display: role="group" + aria-label, decision 25; table: its caption, or just "table").

import { formatString } from '../i18n/format';

const BOX = ':is(.katex-display, table)';
const SELECTOR = `.sl-markdown-content ${BOX}`;
/**
 * A box can overflow without changing size: its content gets wider while the box keeps the column's width.
 * So the observer also watches what is inside (.katex of a formula, the row groups of a table), whose size
 * does change then.
 */
const INSIDE = ':scope > :is(.katex, thead, tbody)';
/** Marks the tabindex this script set, so it never removes one that was in the HTML. */
const MARK = 'data-atlas-scroll';

/**
 * True while the box's content is skipped by content-visibility: auto (src/styles/content-visibility.css).
 * Its size would be a guess, and asking for it would force the layout the rule saves. The box is measured
 * when it is rendered (contentvisibilityautostatechange below).
 */
function isSkipped(box: HTMLElement): boolean {
  const inner = box.firstElementChild;
  return typeof inner?.checkVisibility === 'function' && !inner.checkVisibility({ contentVisibilityAuto: true });
}

/** Reads every box first, then writes, so the writes never force a second layout. */
function measure(boxes: Iterable<HTMLElement>): void {
  const results: [HTMLElement, boolean][] = [];
  for (const box of boxes) {
    if (box.isConnected && !isSkipped(box)) results.push([box, box.scrollWidth > box.clientWidth + 1]);
  }
  for (const [box, overflows] of results) {
    if (overflows && !box.hasAttribute('tabindex')) {
      box.setAttribute('tabindex', '0');
      box.setAttribute(MARK, '');
    } else if (!overflows && box.hasAttribute(MARK)) {
      box.removeAttribute('tabindex');
      box.removeAttribute(MARK);
    }
  }
}

/** Boxes found without a fresh layout (fonts, content-visibility) wait for the next frame, all together. */
const pending = new Set<HTMLElement>();
let frame = 0;

function measureSoon(boxes: Iterable<HTMLElement>): void {
  for (const box of boxes) pending.add(box);
  frame ||= requestAnimationFrame(() => {
    frame = 0;
    const boxes = [...pending];
    pending.clear();
    measure(boxes);
  });
}

/** Boxes in `root`, `root` itself included. */
function boxesIn(root: Element): HTMLElement[] {
  const boxes = [...root.querySelectorAll<HTMLElement>(SELECTOR)];
  if (root instanceof HTMLElement && root.matches(SELECTOR)) boxes.push(root);
  return boxes;
}

// The callback runs right after layout, so measuring there costs no extra layout. It also runs once for every
// box as soon as it is observed: that is the first measurement.
const resizes = new ResizeObserver((entries) => {
  const boxes = new Set<HTMLElement>();
  for (const entry of entries) {
    const box = entry.target.closest<HTMLElement>(BOX);
    if (box) boxes.add(box);
  }
  measure(boxes);
});

function observe(root: Element): void {
  for (const box of boxesIn(root)) {
    resizes.observe(box);
    box.querySelectorAll(INSIDE).forEach((el) => resizes.observe(el));
  }
}

// Expressive Code gives a <pre> that overflows role="region" with no name (axe landmark-unique, section 3.6.3):
// name it "Khối code n" / "Code block n" (template in a <meta> from Head.astro). EC sets the role late and drops
// it when the box fits again, so this follows the attribute and drops its own name too: a bare <pre> may not
// carry aria-label.
const CODE_LABEL = document.querySelector<HTMLMetaElement>('meta[name="atlas-code-block"]')?.content;
const CODE_MARK = 'data-atlas-code-label';

function nameCodeRegion(pre: Element): void {
  const isRegion = pre.getAttribute('role') === 'region';
  if (isRegion && CODE_LABEL && !pre.hasAttribute('aria-label')) {
    const n = [...document.querySelectorAll('.expressive-code pre')].indexOf(pre) + 1;
    pre.setAttribute('aria-label', formatString(CODE_LABEL, { n }));
    pre.setAttribute(CODE_MARK, '');
  } else if (!isRegion && pre.hasAttribute(CODE_MARK)) {
    pre.removeAttribute('aria-label');
    pre.removeAttribute(CODE_MARK);
  }
}

const content = document.querySelector('.sl-markdown-content');
if (content) {
  observe(content);
  // A late font (KaTeX's are font-display: block) widens a formula's glyphs inside inline boxes nobody
  // observes. Once for the fonts of the first paint; later loads come in bursts while reading, so one
  // measurement per frame at most.
  const measureAll = () => measureSoon(boxesIn(content));
  void document.fonts.ready.then(measureAll);
  document.fonts.addEventListener('loadingdone', measureAll);
  // A block of the lesson that content-visibility: auto skipped is rendered when it nears the screen.
  document.addEventListener(
    'contentvisibilityautostatechange',
    (event) => {
      if (!(event as ContentVisibilityAutoStateChangeEvent).skipped && event.target instanceof Element) {
        measureSoon(boxesIn(event.target));
      }
    },
    { capture: true },
  );
  content.querySelectorAll('.expressive-code pre[role]').forEach(nameCodeRegion);
  // Boxes added after load (an island, or a test fixture) are observed too, and so is EC's role on <pre>.
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        if (mutation.target instanceof Element && mutation.target.matches('.expressive-code pre')) {
          nameCodeRegion(mutation.target);
        }
        continue;
      }
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) observe(node);
      });
    }
  }).observe(content, { childList: true, subtree: true, attributes: true, attributeFilter: ['role'] });
}
