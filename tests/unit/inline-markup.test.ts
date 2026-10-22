import { describe, expect, it } from 'vitest';
import { escapeHtml, renderInlineMarkup } from '../../src/lib/inline-markup';

/** Tags that KaTeX (HTML + MathML output) and the `code` token may produce. Nothing else is allowed. */
const ALLOWED_TAGS = new Set([
  'span', 'code', 'svg', 'path', 'line',
  'math', 'semantics', 'annotation', 'mrow', 'mi', 'mo', 'mn', 'ms', 'mtext', 'mspace',
  'msub', 'msup', 'msubsup', 'mfrac', 'msqrt', 'mroot', 'munder', 'mover', 'munderover',
  'mstyle', 'mpadded', 'mphantom', 'menclose', 'mtable', 'mtr', 'mtd', 'merror',
]);

/** Attributes that may appear on those tags. Event handlers, href and src must never appear. */
const ALLOWED_ATTRIBUTES = new Set([
  'class', 'style', 'title', 'xmlns', 'encoding', 'aria-hidden', 'width', 'height', 'viewbox',
  'preserveaspectratio', 'd', 'x1', 'x2', 'y1', 'y2', 'stroke-width',
  'mathvariant', 'stretchy', 'fence', 'separator', 'lspace', 'rspace', 'minsize', 'maxsize',
  'accent', 'accentunder', 'movablelimits', 'linethickness', 'displaystyle', 'scriptlevel',
  'columnalign', 'rowalign', 'columnspacing', 'rowspacing', 'columnlines', 'rowlines', 'notation',
  'symmetric', 'largeop', 'depth', 'voffset', 'mathcolor', 'mathbackground',
]);

/** Fails when the HTML contains a tag or attribute outside the allowlists above. */
function expectOnlySafeMarkup(html: string, input: string): void {
  for (const tag of html.match(/<[^>]*>/g) ?? []) {
    const name = /^<\/?([a-zA-Z][\w-]*)/.exec(tag)?.[1]?.toLowerCase();
    expect(name, `${input} -> ${tag}`).toBeDefined();
    expect(ALLOWED_TAGS.has(name!), `${input} -> tag ${tag}`).toBe(true);
    // KaTeX and escapeHtml always double-quote values and escape '"' inside them.
    const rest = tag.replace(/^<\/?[\w-]+/, '').replace(/\/?>$/, '');
    const withoutValues = rest.replace(/="[^"]*"/g, '');
    for (const attribute of withoutValues.trim().split(/\s+/).filter(Boolean)) {
      expect(ALLOWED_ATTRIBUTES.has(attribute.toLowerCase()), `${input} -> attribute "${attribute}" in ${tag}`).toBe(true);
    }
  }
}

describe('escapeHtml', () => {
  it('escapes tags, ampersands and both quote kinds', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(escapeHtml(`it's & "that"`)).toBe('it&#39;s &amp; &quot;that&quot;');
  });

  it('escapes an existing entity again instead of trusting it', () => {
    expect(escapeHtml('&lt;b&gt;')).toBe('&amp;lt;b&amp;gt;');
  });

  it('leaves plain Vietnamese text unchanged', () => {
    expect(escapeHtml('Tìm $w$ và b')).toBe('Tìm $w$ và b');
  });
});

describe('renderInlineMarkup', () => {
  it('escapes plain text, including <script> and quotes', () => {
    expect(renderInlineMarkup('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
    expect(renderInlineMarkup(`"Close" isn't`)).toBe('&quot;Close&quot; isn&#39;t');
  });

  it('renders $\\hat{y}$ with KaTeX', () => {
    const html = renderInlineMarkup('$\\hat{y}$');
    expect(html).toMatch(/^<span class="katex">/);
    expect(html).toContain('class="katex-html"');
    expect(html).toContain('<annotation encoding="application/x-tex">\\hat{y}</annotation>');
  });

  it('renders math in the middle of text and keeps the text around it', () => {
    const html = renderInlineMarkup('Tìm $w$ và $b$ đi.');
    expect(html.startsWith('Tìm <span class="katex">')).toBe(true);
    expect(html.endsWith('</span> đi.')).toBe(true);
    expect(html.match(/<span class="katex">/g)).toHaveLength(2);
  });

  it('renders `code` and escapes its content', () => {
    expect(renderInlineMarkup('run `print(x)` now')).toBe('run <code>print(x)</code> now');
    expect(renderInlineMarkup('`a < b && "c"`')).toBe('<code>a &lt; b &amp;&amp; &quot;c&quot;</code>');
  });

  it('does not render math inside code', () => {
    expect(renderInlineMarkup('`$x$`')).toBe('<code>$x$</code>');
  });

  it('leaves an unmatched $ alone', () => {
    expect(renderInlineMarkup('costs $5')).toBe('costs $5');
    expect(renderInlineMarkup('$')).toBe('$');
    expect(renderInlineMarkup('$$')).toBe('$$');
    expect(renderInlineMarkup('a $ b\nc $ d')).toBe('a $ b\nc $ d');
  });

  it('leaves an unmatched backtick alone', () => {
    expect(renderInlineMarkup('a ` b')).toBe('a ` b');
  });

  it('does not throw on invalid TeX and escapes the error text', () => {
    const html = renderInlineMarkup('$\\frac{1}{$');
    expect(html).toContain('katex-error');
    expectOnlySafeMarkup(html, '$\\frac{1}{$');
  });

  it('returns no "<" at all for text without tokens', () => {
    for (const input of ['<b>bold</b>', '<<>>', 'a < b > c', '<img src=x onerror=alert(1)>']) {
      expect(renderInlineMarkup(input), input).not.toContain('<');
    }
  });

  it('never passes a raw tag or attribute from the input through', () => {
    const inputs = [
      '<script>alert(1)</script>',
      '$<img src=x onerror=alert(1)>$',
      '$x < y$ and <b>y</b>',
      '`<b>bold</b>`',
      '`</code><script>alert(1)</script>`',
      '$\\foo<script>alert(1)</script>$',
      '$\\href{javascript:alert(1)}{x}$',
      '$\\url{javascript:alert(1)}$',
      '$\\htmlClass{x}{y}$',
      '$\\htmlData{onclick=alert(1)}{y}$',
      '$\\includegraphics{x.png}$',
      '$\\text{<img src=x onerror=alert(1)>}$',
      '" onmouseover="alert(1)',
    ];
    for (const input of inputs) {
      const html = renderInlineMarkup(input);
      expect(html.toLowerCase(), input).not.toMatch(/<(script|img|b|a|iframe)[\s>/]/);
      expectOnlySafeMarkup(html, input);
    }
  });
});
