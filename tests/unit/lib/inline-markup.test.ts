import { describe, expect, it } from 'vitest';
import { escapeHtml, inlineMarkupLabel, proseLessonIds, renderInlineMarkup, renderProseMarkup } from '../../../src/lib/inline-markup';

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

describe('inlineMarkupLabel (accessible names, decision 12)', () => {
  it('keeps plain text and replaces $...$ with its TeX source', () => {
    expect(inlineMarkupLabel(String.raw`Nếu $\eta$ quá lớn`)).toBe(String.raw`Nếu \eta quá lớn`);
    expect(inlineMarkupLabel(String.raw`$\frac{1}{2}$`)).toBe(String.raw`\frac{1}{2}`);
  });

  it('keeps the text of `code`', () => {
    expect(inlineMarkupLabel('`np.mean(x)` trả về gì?')).toBe('np.mean(x) trả về gì?');
  });

  it('returns plain text, not HTML: nothing is escaped', () => {
    expect(inlineMarkupLabel('$a < b$ & `"x"`')).toBe('a < b & "x"');
  });

  it('trims the TeX source and collapses runs of spaces', () => {
    expect(inlineMarkupLabel('  Tính $ x^2 $   và  $y$ ')).toBe('Tính x^2 và y');
  });

  it('is never empty for a non-empty option, even one that is only a formula', () => {
    for (const option of ['$2$', String.raw`$\hat{y}$`, '`0`', 'Giảm dần']) {
      expect(inlineMarkupLabel(option), option).not.toBe('');
    }
  });

  it('leaves a lone "$" as it is, like renderInlineMarkup', () => {
    expect(inlineMarkupLabel('Giá 5$')).toBe('Giá 5$');
  });
});

describe('renderProseMarkup (homepage letter: **marks** and lesson links)', () => {
  const hrefs: Record<string, string> = { 'ml/linear-regression': '/vi/ml/linear-regression/' };
  const lessonHref = (id: string) => hrefs[id];

  it('turns [label](lesson:<id>) into a link to the URL the resolver gives', () => {
    expect(renderProseMarkup('Bài đầu tiên: [Hồi quy tuyến tính](lesson:ml/linear-regression). Hẹn gặp.', lessonHref)).toBe(
      'Bài đầu tiên: <a href="/vi/ml/linear-regression/">Hồi quy tuyến tính</a>. Hẹn gặp.',
    );
  });

  it('keeps the label as plain text when the lesson has no page', () => {
    expect(renderProseMarkup('Soon: [Gradient descent](lesson:ml/gradient-descent).', lessonHref)).toBe(
      'Soon: Gradient descent.',
    );
  });

  it('still marks **phrase**, also inside a link label', () => {
    expect(renderProseMarkup('needs **no account**', lessonHref)).toBe('needs <mark>no account</mark>');
    expect(renderProseMarkup('[**open**](lesson:ml/linear-regression)', lessonHref)).toBe(
      '<a href="/vi/ml/linear-regression/"><mark>open</mark></a>',
    );
  });

  it('escapes the label and the text around it', () => {
    expect(renderProseMarkup(`<b>x</b> [a "b" & 'c' <i>](lesson:ml/linear-regression)`, lessonHref)).toBe(
      '&lt;b&gt;x&lt;/b&gt; <a href="/vi/ml/linear-regression/">a &quot;b&quot; &amp; &#39;c&#39; &lt;i&gt;</a>',
    );
  });

  it('escapes the URL the resolver returns', () => {
    expect(renderProseMarkup('[x](lesson:ml/a)', () => '/a?b="c"&d=<e>')).toBe(
      '<a href="/a?b=&quot;c&quot;&amp;d=&lt;e&gt;">x</a>',
    );
  });

  it('makes links from lesson: targets only: any other target stays text, and the resolver is not asked', () => {
    const asked: string[] = [];
    const spy = (id: string) => {
      asked.push(id);
      return '/x/';
    };
    for (const input of ['[x](javascript:alert(1))', '[x](https://example.com)', '[x](/vi/ml/a/)']) {
      const html = renderProseMarkup(input, spy);
      expect(html, input).not.toContain('<a');
      expect(html, input).toBe(escapeHtml(input));
    }
    expect(asked).toEqual([]);
  });

  it('throws on a lesson link with a malformed id, so the build fails, and never asks the resolver', () => {
    const asked: string[] = [];
    const spy = (id: string) => {
      asked.push(id);
      return '/x/';
    };
    const inputs = [
      '[x](lesson:ML/x)',
      '[x](lesson:ml/x/)',
      '[x](lesson:ml/x-)',
      '[x](lesson: ml/x)',
      '[x](lesson:javascript:alert(1))',
      '[x](lesson:ml/a" onmouseover="alert(1))',
      '[x](lesson:)',
      '[x\ny](lesson:ml/a)',
      'Fine: [a](lesson:ml/a), broken: [b](lesson:ml/b/).',
    ];
    for (const input of inputs) {
      expect(() => renderProseMarkup(input, spy), input).toThrow(/malformed lesson link/);
    }
    // The good link of the last input was resolved before the check; no malformed id ever was.
    expect(asked).toEqual(['ml/a']);
  });

  it('throws when **marks** cross a link instead of nesting', () => {
    for (const input of ['**a [b** c](lesson:ml/linear-regression)', '[a **b](lesson:ml/linear-regression) c**']) {
      expect(() => renderProseMarkup(input, lessonHref), input).toThrow(/crosses a lesson link/);
    }
  });

  it('accepts **marks** around a whole link, or inside its label', () => {
    expect(renderProseMarkup('**see [this](lesson:ml/linear-regression) now**', lessonHref)).toBe(
      '<mark>see <a href="/vi/ml/linear-regression/">this</a> now</mark>',
    );
    expect(renderProseMarkup('[a **b** c](lesson:ml/linear-regression)', lessonHref)).toBe(
      '<a href="/vi/ml/linear-regression/">a <mark>b</mark> c</a>',
    );
  });

  it('proseLessonIds lists the linked ids in order', () => {
    expect(proseLessonIds('[a](lesson:ml/a) and [b](lesson:python/b-c) and [c](https://x)')).toEqual(['ml/a', 'python/b-c']);
    expect(proseLessonIds('no links')).toEqual([]);
  });
});
