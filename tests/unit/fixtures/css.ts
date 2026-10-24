// CSS helpers for the size and colour rules of the shared stylesheets (viz.css, figures.css).
// Used by tests/unit/viz-conventions.test.ts and tests/unit/figure-conventions.test.ts.

/**
 * Removes CSS comments, as a minifier does, for the size budget (decision 27 in docs/mvp.md).
 * Follows the CSS tokenizer: "/*" inside a quoted string or an unquoted url(...) is not a comment, and a
 * comment left open runs to the end of the file.
 */
export function stripCssComments(css: string): string {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const char = css[i];
    if (char === '"' || char === "'") {
      // A string runs to the same quote that is not escaped, or to the end of the line.
      let end = i + 1;
      while (end < css.length && css[end] !== char && css[end] !== '\n') end += css[end] === '\\' ? 2 : 1;
      out += css.slice(i, end + 1);
      i = end + 1;
    } else if (char === '/' && css[i + 1] === '*') {
      const close = css.indexOf('*/', i + 2);
      i = close === -1 ? css.length : close + 2;
    } else if (/^url\(\s*[^\s"')]/i.test(css.slice(i, i + 64)) && !/[\w-]/.test(css[i - 1] ?? '')) {
      // An unquoted url(...) is one token up to ")".
      const close = css.indexOf(')', i);
      const end = close === -1 ? css.length : close + 1;
      out += css.slice(i, end);
      i = end;
    } else {
      out += char;
      i += 1;
    }
  }
  return out;
}
