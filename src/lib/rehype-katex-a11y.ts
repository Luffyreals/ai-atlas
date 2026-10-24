// Build-time rehype step, run right after rehype-katex (decision 25 in docs/decisions.md): every display
// formula (.katex-display) becomes role="group" with an aria-label made of the word "Formula" in the
// page's language plus its TeX source. A formula wider than the column scrolls in its own box
// (custom.css), and Chrome then makes that box a Tab stop; the name says what the reader has reached.
// No browser JS, no runtime dependency: type imports only and a small walk over the tree.
// Loaded by astro.config.ts: relative imports only, never `astro:*`.
import type { RehypePlugin } from '@astrojs/markdown-remark';
import type { Element, ElementContent, Root, RootContent } from 'hast';
import { LOCALES, type Locale, type Localized } from '../data/roadmap';
import { formatString } from '../i18n/format';

export interface KatexA11yOptions {
  /** Label template per page language, with {{tex}}, e.g. { vi: 'Công thức: {{tex}}', en: 'Formula: {{tex}}' }. */
  labels: Localized;
}

/** Used when the language of the file is unknown: the TeX source alone, in no language. */
const NEUTRAL_LABEL = '{{tex}}';

/**
 * The page language of a content file, read from its path: the last folder named after a locale,
 * e.g. '…/src/content/docs/vi/ml/linear-regression.mdx' → 'vi'. Undefined when there is none.
 */
export function localeOfPath(path: string | undefined): Locale | undefined {
  if (!path) return undefined;
  const folders = path.split(/[\\/]/).slice(0, -1);
  return folders.findLast((folder): folder is Locale => (LOCALES as readonly string[]).includes(folder));
}

/** hast keeps `class` as an array in `className` (as rehype-katex itself reads it). */
function hasClass(element: Element, name: string): boolean {
  const value = element.properties.className;
  return Array.isArray(value) && value.includes(name);
}

function textOf(node: ElementContent): string {
  if (node.type === 'text') return node.value;
  return 'children' in node ? node.children.map(textOf).join('') : '';
}

/** The TeX source KaTeX keeps in its MathML: <annotation encoding="application/x-tex">. */
function texOf(element: Element): string | undefined {
  for (const child of element.children) {
    if (child.type !== 'element') continue;
    if (child.tagName === 'annotation' && child.properties.encoding === 'application/x-tex') {
      return textOf(child).replace(/\s+/g, ' ').trim();
    }
    const found = texOf(child);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** Names every .katex-display under `node`. Walks MDX JSX nodes too, so formulas inside components count. */
export function labelDisplayFormulas(node: Root | RootContent, template: string): void {
  if (node.type === 'element' && hasClass(node, 'katex-display')) {
    const tex = texOf(node);
    if (tex) {
      node.properties.role ??= 'group';
      node.properties.ariaLabel ??= formatString(template, { tex });
    }
    return;
  }
  if ('children' in node) for (const child of node.children) labelDisplayFormulas(child, template);
}

const rehypeKatexA11y: RehypePlugin<[KatexA11yOptions]> = (options) => (tree, file) => {
  const locale = localeOfPath(file.path);
  labelDisplayFormulas(tree, locale ? options.labels[locale] : NEUTRAL_LABEL);
};

export default rehypeKatexA11y;
