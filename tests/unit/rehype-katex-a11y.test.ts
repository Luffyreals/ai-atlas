// @vitest-environment jsdom
// src/lib/rehype-katex-a11y.ts, run through Astro's own Markdown pipeline (the `unified` processor
// that astro.config.ts uses) with remark-math and rehype-katex in front of it, as on the site.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import type { Element, Root } from 'hast';
import katex from 'katex';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { describe, expect, it } from 'vitest';
import rehypeKatexA11y, { labelDisplayFormulas, localeOfPath } from '../../src/lib/rehype-katex-a11y';

// Vitest runs from the project root. (import.meta.url is not a file: URL under the jsdom environment.)
const ROOT = process.cwd();
const LABELS = { vi: 'Công thức: {{tex}}', en: 'Formula: {{tex}}' };

const processor = await createMarkdownProcessor({
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex, [rehypeKatexA11y, { labels: LABELS }]],
});

/** Renders Markdown as if it were the file at `path` (relative to the project), and parses the HTML. */
async function render(markdown: string, path?: string): Promise<Document> {
  const fileURL = path ? pathToFileURL(join(ROOT, path)) : undefined;
  const { code } = await processor.render(markdown, { fileURL });
  return new DOMParser().parseFromString(code, 'text/html');
}

const displays = (doc: Document) =>
  [...doc.querySelectorAll('.katex-display')].map((el) => ({
    role: el.getAttribute('role'),
    label: el.getAttribute('aria-label'),
  }));

const ALIGNED = String.raw`$$
\begin{aligned}
\det\left(\mathbf{X}^\top\mathbf{X}\right) &= m\sum_{i}\left(x^{(i)}\right)^2 - \Big(\sum_{i} x^{(i)}\Big)^2 \\
&= m\sum_{i}\left(x^{(i)} - \bar{x}\right)^2
\end{aligned}
$$`;

describe('rehype-katex-a11y in the Markdown pipeline', () => {
  it('names every display formula in the language of a vi file, and leaves inline math alone', async () => {
    const doc = await render('Inline $\\hat{y} = wx + b$ here.\n\n$$\n\\mathcal{L} = \\frac{1}{m}\n$$\n\n$$\nx^2\n$$\n', 'src/content/docs/vi/ml/x.md');
    expect(displays(doc)).toEqual([
      { role: 'group', label: 'Công thức: \\mathcal{L} = \\frac{1}{m}' },
      { role: 'group', label: 'Công thức: x^2' },
    ]);
    const inline = [...doc.querySelectorAll('.katex')].filter((el) => !el.closest('.katex-display'));
    expect(inline).toHaveLength(1);
    expect(inline[0]?.closest('[role], [aria-label]')).toBeNull();
  });

  it('uses the en label for a file under docs/en/', async () => {
    const doc = await render('$$\nx^2\n$$\n', 'src/content/docs/en/ml/x.md');
    expect(displays(doc)).toEqual([{ role: 'group', label: 'Formula: x^2' }]);
  });

  it('falls back to the TeX source alone when the file has no locale folder, or no path', async () => {
    expect(displays(await render('$$\nx^2\n$$\n', 'src/pages/notes.md'))).toEqual([{ role: 'group', label: 'x^2' }]);
    expect(displays(await render('$$\nx^2\n$$\n'))).toEqual([{ role: 'group', label: 'x^2' }]);
  });

  it('keeps the TeX of a multi-line aligned block, on one line', async () => {
    const [display] = displays(await render(ALIGNED, 'src/content/docs/vi/ml/x.md'));
    expect(display?.label).toBe(
      'Công thức: \\begin{aligned} \\det\\left(\\mathbf{X}^\\top\\mathbf{X}\\right) &= m\\sum_{i}\\left(x^{(i)}\\right)^2 - ' +
        '\\Big(\\sum_{i} x^{(i)}\\Big)^2 \\\\ &= m\\sum_{i}\\left(x^{(i)} - \\bar{x}\\right)^2 \\end{aligned}',
    );
  });

  it('escapes the label: quotes, < and & in TeX stay inside the attribute', async () => {
    const doc = await render('$$\na < b \\text{"x" \\& y} > c\n$$\n', 'src/content/docs/vi/x.md');
    expect(displays(doc)).toEqual([{ role: 'group', label: 'Công thức: a < b \\text{"x" \\& y} > c' }]);
    // Nothing leaked out of the attribute into the markup.
    expect(doc.querySelectorAll('.katex-display [onerror], script')).toHaveLength(0);
  });
});

/** A display formula as KaTeX renders it, as a hast element (only the parts the plugin reads). */
function katexDisplay(tex: string, properties: Element['properties'] = {}): Element {
  return {
    type: 'element',
    tagName: 'span',
    properties: { className: ['katex-display'], ...properties },
    children: [
      {
        type: 'element',
        tagName: 'math',
        properties: {},
        children: [
          {
            type: 'element',
            tagName: 'annotation',
            properties: { encoding: 'application/x-tex' },
            children: [{ type: 'text', value: tex }],
          },
        ],
      },
    ],
  };
}

describe('labelDisplayFormulas', () => {
  it('walks into MDX components, so a formula inside <Aside> is named too', () => {
    const formula = katexDisplay('x^2');
    const tree = {
      type: 'root',
      children: [{ type: 'mdxJsxFlowElement', name: 'Aside', attributes: [], children: [formula] }],
    } as unknown as Root;
    labelDisplayFormulas(tree, 'Formula: {{tex}}');
    expect(formula.properties).toMatchObject({ role: 'group', ariaLabel: 'Formula: x^2' });
  });

  it('keeps a role or label that is already there', () => {
    const formula = katexDisplay('x^2', { role: 'math', ariaLabel: 'x squared' });
    labelDisplayFormulas({ type: 'root', children: [formula] }, 'Formula: {{tex}}');
    expect(formula.properties).toMatchObject({ role: 'math', ariaLabel: 'x squared' });
  });

  it('leaves a display without a TeX annotation unnamed', () => {
    const formula: Element = { type: 'element', tagName: 'span', properties: { className: ['katex-display'] }, children: [] };
    labelDisplayFormulas({ type: 'root', children: [formula] }, 'Formula: {{tex}}');
    expect(formula.properties).toEqual({ className: ['katex-display'] });
  });

  it('reads the annotation KaTeX really writes (control for the hand-made tree above)', () => {
    const html = katex.renderToString('x^2', { displayMode: true, output: 'htmlAndMathml' });
    expect(html).toContain('class="katex-display"');
    expect(html).toContain('<annotation encoding="application/x-tex">x^2</annotation>');
  });
});

describe('localeOfPath', () => {
  it('reads the locale folder of posix and Windows paths', () => {
    expect(localeOfPath('/repo/src/content/docs/vi/ml/linear-regression.mdx')).toBe('vi');
    expect(localeOfPath('C:\\repo\\src\\content\\docs\\en\\ml\\linear-regression.mdx')).toBe('en');
    expect(localeOfPath('C:/repo/src/content/docs/en/index.mdx')).toBe('en');
  });

  it('takes the folder nearest the file, so a project kept under /en/ still reads vi', () => {
    expect(localeOfPath('/home/en/ai-atlas/src/content/docs/vi/ml/x.mdx')).toBe('vi');
  });

  it('is undefined without a locale folder; a file named like a locale does not count', () => {
    expect(localeOfPath(undefined)).toBeUndefined();
    expect(localeOfPath('/repo/src/pages/notes.md')).toBeUndefined();
    expect(localeOfPath('/repo/notes/en')).toBeUndefined();
    expect(localeOfPath('/repo/vietnamese/english/x.md')).toBeUndefined();
  });
});
