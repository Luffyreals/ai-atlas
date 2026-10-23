// Build-time renderers for short strings from data files: $math$ and `code` (homepage slips, Quiz),
// **marks** and lesson links (homepage letter).
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

// [label](lesson:<id>), e.g. [Linear Regression](lesson:ml/linear-regression). Ids only, never a URL.
const LESSON_LINK = /\[([^\]\n]+)\]\(lesson:([a-z0-9]+(?:[/-][a-z0-9]+)*)\)/g;

const count = (text: string, part: string) => text.split(part).length - 1;

/**
 * Prose from data files (the homepage letter). Escapes HTML, then **phrase** becomes <mark>phrase</mark>
 * and [label](lesson:<id>) a link to that lesson. `lessonHref(id)` returns the URL from the roadmap, or
 * undefined when the lesson has no page; the label then stays plain text. Build-time only.
 * Throws, so the build fails, on a link that is not [label](lesson:<part>/<slug>) (e.g. `lesson:ML/x`,
 * a trailing "/") and on **marks** that cross a link (`**a [b** c](lesson:ml/x)`).
 */
export function renderProseMarkup(text: string, lessonHref: (id: string) => string | undefined): string {
  const html = escapeHtml(text)
    .replace(LESSON_LINK, (_, label: string, id: string) => {
      const href = lessonHref(id);
      return href === undefined ? label : `<a href="${escapeHtml(href)}">${label}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, (_, inner: string) => {
      // Escaped text holds no "<", so every <a and </a> here is a link made above.
      if (count(inner, '<a ') !== count(inner, '</a>')) {
        throw new Error(`renderProseMarkup: **…** crosses a lesson link in "${text}". Keep the marks inside or outside the link.`);
      }
      return `<mark>${inner}</mark>`;
    });
  if (html.includes('](lesson:')) {
    throw new Error(`renderProseMarkup: malformed lesson link in "${text}". Write [label](lesson:<part>/<slug>), lowercase, no "/" at the end.`);
  }
  return html;
}

/** Lesson ids linked with [label](lesson:<id>) in `text`, in order. */
export function proseLessonIds(text: string): string[] {
  return [...text.matchAll(LESSON_LINK)].map((match) => match[2] ?? '');
}

/**
 * The same string as plain text for an accessible name (aria-label): $...$ becomes its TeX source,
 * `code` its text. Chrome leaves KaTeX's MathML out of the names it computes, so a label made of
 * renderInlineMarkup() HTML alone can come out empty there.
 */
export function inlineMarkupLabel(text: string): string {
  return text
    .replace(TOKEN, (_, math: string | undefined, code: string | undefined) => (math ?? code ?? '').trim())
    .replace(/\s+/g, ' ')
    .trim();
}
