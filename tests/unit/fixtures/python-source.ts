// A small Python lexer for the code tests: comments and string literals, nothing else.
// Shared by code-pairs.test.ts (pair rules, docs/architecture/llm-lessons.md sections 2.4 and 4.5) and
// llm-code.test.ts. It handles '...', "...", '''...''', """...""" with any prefix (f, r, b, rb…) and backslash
// escapes. An f-string is one string from its opening to its closing quote, "{...}" included: with
// feature_version (3, 10) (python-syntax.test.ts) an f-string cannot reuse its own quote inside "{...}".

export interface PyString {
  /** Index of the opening quote in the normalised text (after the prefix). */
  start: number;
  /** Index just after the closing quote (end of the line for an unterminated one-line string). */
  end: number;
  /** 1-based line of the opening quote. */
  line: number;
  /** The delimiter: ', ", ''' or """. */
  quote: string;
  /** The text between the quotes, escapes as written. */
  content: string;
  /** false for a one-line string that reaches the end of its line, or any string that reaches the end of the file. */
  closed: boolean;
}

export interface PyComment {
  /** Index of "#" in the normalised text. */
  start: number;
  /** 1-based line. */
  line: number;
  /** From "#" to the end of the line. */
  text: string;
  /** The line has nothing but this comment (and spaces). */
  alone: boolean;
}

export interface PyScan {
  /** The source with "\r\n" and "\r" turned into "\n". */
  text: string;
  strings: PyString[];
  comments: PyComment[];
}

export function scanPython(source: string): PyScan {
  const text = source.replace(/\r\n?/g, '\n');
  const strings: PyString[] = [];
  const comments: PyComment[] = [];
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\n') {
      line++;
      lineStart = i + 1;
    } else if (char === '#') {
      let end = i;
      while (end + 1 < text.length && text[end + 1] !== '\n') end++;
      comments.push({ start: i, line, text: text.slice(i, end + 1), alone: text.slice(lineStart, i).trim() === '' });
      i = end;
    } else if (char === '"' || char === "'") {
      const quote = text.startsWith(char.repeat(3), i) ? char.repeat(3) : char;
      const start = i;
      const startLine = line;
      let j = i + quote.length;
      let end = -1;
      while (j < text.length) {
        const c = text[j];
        if (c === '\\') {
          if (text[j + 1] === '\n') {
            line++;
            lineStart = j + 2;
          }
          j += 2;
        } else if (text.startsWith(quote, j)) {
          end = j + quote.length;
          break;
        } else if (c === '\n') {
          if (quote.length === 1) break; // unterminated one-line string: Python refuses it anyway
          line++;
          lineStart = j + 1;
          j++;
        } else {
          j++;
        }
      }
      const closed = end !== -1;
      const stop = closed ? end : j;
      strings.push({
        start,
        end: stop,
        line: startLine,
        quote,
        content: text.slice(start + quote.length, closed ? stop - quote.length : stop),
        closed,
      });
      i = stop - 1;
    }
  }
  return { text, strings, comments };
}

/**
 * Removes "#" comments: from "#" to the end of the line, unless the "#" is inside a string.
 * Returns one entry per source line, trailing spaces removed; comment-only lines become "".
 */
export function stripComments(source: string): string[] {
  const { text, comments } = scanPython(source);
  let out = '';
  let offset = 0;
  for (const comment of comments) {
    out += text.slice(offset, comment.start);
    offset = comment.start + comment.text.length;
  }
  out += text.slice(offset);
  return out.split('\n').map((row) => row.trimEnd());
}

/**
 * stripComments, then the content of every string emptied: "Bạn là trợ lý" and "You are an assistant" both
 * become "". Prefixes and quotes stay, and so do the line breaks inside a multi-line string, so the line
 * numbers of the code after it do not move (docs/architecture/llm-lessons.md section 2.4).
 */
export function blankStrings(source: string): string[] {
  const { text, strings, comments } = scanPython(source);
  const cuts: { start: number; end: number; keep: string }[] = [];
  for (const comment of comments) cuts.push({ start: comment.start, end: comment.start + comment.text.length, keep: '' });
  for (const str of strings) {
    const inner = str.content.replace(/[^\n]/g, '');
    cuts.push({ start: str.start, end: str.end, keep: str.quote + inner + (str.closed ? str.quote : '') });
  }
  cuts.sort((a, b) => a.start - b.start);
  let offset = 0;
  let out = '';
  for (const cut of cuts) {
    out += text.slice(offset, cut.start) + cut.keep;
    offset = cut.end;
  }
  out += text.slice(offset);
  return out.split('\n').map((row) => row.trimEnd());
}

// --- Vietnamese text in a translated .en.py (llm-lessons.md section 4.5) ---

/** Vietnamese letters with diacritics: ă â đ ê ô ơ ư (both cases) and U+1EA0–U+1EF9. Checked on NFC text. */
export const VIETNAMESE = /[ăâđêôơưĂÂĐÊÔƠƯẠ-ỹ]/;

/** A comment that marks Vietnamese data, e.g. "# data: vi" or "# data: vi; lines 1-20 to train". */
export const DATA_MARKER = /(?:^#|[\s;,(])data:\s*vi\b/;

export interface VietnameseHit {
  line: number;
  /** 'comment', 'string' or 'code'. */
  where: string;
}

/**
 * Lines of an .en.py that still hold Vietnamese, outside the strings marked as Vietnamese data.
 * A comment with "data: vi" marks every string that starts on its own line (a trailing comment), or, when the
 * comment stands alone on its line, every string that starts on the next line with code. The marked strings
 * may hold Vietnamese (the 24 lines of the Tale of Kieu, a lookup key such as "hoa cười"); comments, other
 * strings and code may not.
 */
export function vietnameseOutsideData(source: string): VietnameseHit[] {
  const { text, strings, comments } = scanPython(source.normalize('NFC'));
  const lines = text.split('\n');
  const commentLines = new Map(comments.map((comment) => [comment.line, comment]));
  const markedLines = new Set<number>();
  for (const comment of comments) {
    if (!DATA_MARKER.test(comment.text)) continue;
    if (!comment.alone) {
      markedLines.add(comment.line);
      continue;
    }
    // The next line with code: skip blank lines and comment-only lines.
    let next = comment.line + 1;
    while (next <= lines.length && ((lines[next - 1] ?? '').trim() === '' || commentLines.get(next)?.alone)) next++;
    markedLines.add(next);
  }

  const hits: VietnameseHit[] = [];
  const seen = new Set<string>();
  const hit = (line: number, where: string) => {
    const key = `${line}:${where}`;
    if (!seen.has(key)) hits.push({ line, where });
    seen.add(key);
  };
  for (const comment of comments) if (VIETNAMESE.test(comment.text)) hit(comment.line, 'comment');
  for (const str of strings) {
    if (markedLines.has(str.line)) continue;
    str.content.split('\n').forEach((row, index) => {
      if (VIETNAMESE.test(row)) hit(str.line + index, 'string');
    });
  }
  // Code outside strings and comments (Python allows non-ASCII names).
  blankStrings(text).forEach((row, index) => {
    if (VIETNAMESE.test(row)) hit(index + 1, 'code');
  });
  return hits.sort((a, b) => a.line - b.line);
}
