// Fenced code blocks of a Markdown or MDX file, for python-syntax.test.ts and code-secrets.test.ts.
// Same fences as prose() in lesson-shape.ts ("```" or "~~~", closed by the same character, at least as long),
// with two differences: an opening fence may be indented by any amount (inside a component or a list item; its
// indentation is removed from the code), and a fence inside an MDX comment {/* ... */} is left out.

export interface Fence {
  /** First word of the info string, lower case: 'python', 'sh', '' when none. */
  lang: string;
  /** 1-based line of the first code line in the file. */
  line: number;
  code: string;
}

export function codeFences(source: string): Fence[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const fences: Fence[] = [];
  let open: { marker: string; indent: number; lang: string; line: number; code: string[] } | null = null;
  let inComment = false;
  lines.forEach((row, index) => {
    if (open) {
      const close = /^(\s*)(`{3,}|~{3,})\s*$/.exec(row);
      if (close?.[2] && close[2][0] === open.marker[0] && close[2].length >= open.marker.length) {
        fences.push({ lang: open.lang, line: open.line, code: open.code.join('\n') });
        open = null;
      } else {
        // Remove up to `indent` leading spaces, as CommonMark does for an indented fence.
        let cut = 0;
        while (cut < open.indent && row[cut] === ' ') cut++;
        open.code.push(row.slice(cut));
      }
      return;
    }
    if (inComment) {
      if (row.includes('*/}')) {
        inComment = false;
        row = row.slice(row.indexOf('*/}') + 3);
      } else {
        return;
      }
    }
    // Comments that close on the same line are removed; one left open runs to a later line.
    const text = row.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    if (text.includes('{/*')) {
      inComment = true;
      return;
    }
    const start = /^(\s*)(`{3,}|~{3,})\s*([^\s`]*)/.exec(text);
    if (start?.[2]) {
      open = { marker: start[2], indent: start[1]?.length ?? 0, lang: (start[3] ?? '').toLowerCase(), line: index + 2, code: [] };
    }
  });
  return fences;
}
