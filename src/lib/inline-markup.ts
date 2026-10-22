// Build-time renderer for short strings that may carry $math$ or `code`.
// Used by components that take text from data files (homepage slips; Quiz in M1).
import katex from 'katex';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

// $...$ (no newline inside) or `...`; everything else is plain text.
const TOKEN = /\$([^$\n]+)\$|`([^`\n]+)`/g;

/** Escapes HTML, renders $...$ with KaTeX (throwOnError: false) and `code`. Build-time only. */
export function renderInlineMarkup(text: string): string {
  let html = '';
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    html += escapeHtml(text.slice(last, index));
    const [, math, code] = match;
    if (math !== undefined) {
      html += katex.renderToString(math, { throwOnError: false, output: 'htmlAndMathml' });
    } else if (code !== undefined) {
      html += `<code>${escapeHtml(code)}</code>`;
    }
    last = index + match[0].length;
  }
  return html + escapeHtml(text.slice(last));
}
