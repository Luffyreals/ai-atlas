// Structure of a lesson MDX file, to check that the vi and en files of a lesson match (CLAUDE.md,
// "Quy tắc nội dung": same structure, formulas, code and components; text and comments may differ).
// Used by tests/unit/lesson-pairs.test.ts and tests/e2e/lessons.spec.ts.
import { parse as parseYaml } from 'yaml';

/** Components of the lesson template (docs/lesson-template.mdx), counted even when a file forgets the import. */
export const LESSON_COMPONENTS = ['Prerequisites', 'PythonRunner', 'Quiz', 'LessonProgress'] as const;

export interface LessonShape {
  h2: number;
  h3: number;
  /** "$$" delimiters / 2, one per display formula. A half means an unclosed "$$". */
  displayMath: number;
  /** The body (not the frontmatter) has $inline$ or $$display$$ math. */
  hasMath: boolean;
  /** Tags per component: the lesson components (0 when absent) and every other <PascalCase> tag (viz, …). */
  components: Record<string, number>;
  /** Component tags in document order, e.g. ['Prerequisites', 'LineFit', 'PythonRunner', 'Quiz']. */
  sequence: string[];
  /** ESM imports, whitespace normalised, in file order. */
  imports: string[];
  /** Frontmatter `quiz`: number of options and the answer of each question; undefined without a quiz. */
  quiz?: { options: number; answer: unknown }[];
}

// Same fences as Astro's frontmatter parser (@astrojs/internal-helpers/frontmatter), YAML only.
const FRONTMATTER = /^(?:﻿?|\s*\n)---([\s\S]*?\n)---/;

export function splitMdx(source: string): { data: Record<string, unknown>; body: string } {
  const text = source.replace(/\r\n?/g, '\n');
  const match = FRONTMATTER.exec(text);
  if (!match) return { data: {}, body: text };
  // Same YAML options as Astro (@astrojs/internal-helpers/yaml): core schema, merge keys.
  const data: unknown = parseYaml(match[1] ?? '', { schema: 'core', merge: true });
  const isObject = typeof data === 'object' && data !== null && !Array.isArray(data);
  return { data: isObject ? (data as Record<string, unknown>) : {}, body: text.slice(match[0].length) };
}

/**
 * The body with fenced code blocks, MDX comments and inline code blanked out, so that "## " in Python,
 * "$$" in `code` or "<Quiz />" in a comment are not counted. Keeps the line count.
 */
export function prose(body: string): string {
  const lines: string[] = [];
  let fence = ''; // the open fence ("```", "~~~~"), '' outside code blocks
  for (const line of body.split('\n')) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length && line.trim() === marker) fence = '';
      lines.push('');
    } else if (marker) {
      fence = marker;
      lines.push('');
    } else {
      lines.push(line);
    }
  }
  return lines
    .join('\n')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, (comment) => comment.replace(/[^\n]/g, ''))
    .replace(/`[^`\n]+`/g, '``');
}

const IMPORT = /^import\s+(?:([\w$*{}\s,]+?)\s+from\s*)?(['"])([^'"\n]+)\2;?/gm;

function normaliseBindings(bindings: string): string {
  return bindings
    .replace(/\s+/g, ' ')
    .replace(/\{\s*/g, '{ ')
    .replace(/\s*\}/g, ' }')
    .replace(/\s*,\s*/g, ', ')
    .trim();
}

export function lessonShape(source: string): LessonShape {
  const { data, body } = splitMdx(source);
  const text = prose(body);

  const levels = text.split('\n').flatMap((line) => {
    const hashes = /^ {0,3}(#{1,6})(?:[ \t]|$)/.exec(line)?.[1];
    return hashes ? [hashes.length] : [];
  });

  const imports = [...text.matchAll(IMPORT)].map(([, bindings, , path]) =>
    bindings ? `import ${normaliseBindings(bindings)} from '${path}'` : `import '${path}'`,
  );

  // In MDX every tag that starts with a capital is a component, imported or not (a missing import fails
  // the build anyway). Counting tags rather than imports also catches a viz component used twice.
  const sequence = [...text.matchAll(/<([A-Z][\w.]*)(?=[\s/>])/g)].map((match) => match[1] ?? '');
  const names = new Set<string>([...LESSON_COMPONENTS, ...sequence]);
  const components = Object.fromEntries(
    [...names].map((name) => [name, sequence.filter((found) => found === name).length]),
  );

  const quiz = Array.isArray(data.quiz)
    ? data.quiz.map((question: unknown) => {
        const q = (typeof question === 'object' && question !== null ? question : {}) as Record<string, unknown>;
        return { options: Array.isArray(q.options) ? q.options.length : -1, answer: q.answer };
      })
    : undefined;

  return {
    h2: levels.filter((level) => level === 2).length,
    h3: levels.filter((level) => level === 3).length,
    displayMath: (text.match(/\$\$/g) ?? []).length / 2,
    hasMath: /(?<!\\)\$/.test(text),
    components,
    sequence,
    imports,
    quiz,
  };
}

/** The import the en file must have for a vi import: only "<name>.vi.py" becomes "<name>.en.py". */
export function toEnImport(statement: string): string {
  return statement.replace(/\.vi\.py(?=[?'"])/g, '.en.py');
}

/** Imports of code written for the other language, e.g. an en lesson importing "fit.vi.py?raw". */
export function otherLanguageImports(shape: LessonShape, locale: 'vi' | 'en'): string[] {
  const other = locale === 'vi' ? 'en' : 'vi';
  return shape.imports.filter((statement) => new RegExp(`\\.${other}\\.py(?=[?'"])`).test(statement));
}

/** Items of `a` missing from `b`, counting repeats. */
function missingFrom(a: readonly string[], b: readonly string[]): string[] {
  const left = [...b];
  return a.filter((item) => {
    const index = left.indexOf(item);
    if (index === -1) return true;
    left.splice(index, 1);
    return false;
  });
}

/** Every structural difference between the vi and en file of a lesson, as readable lines. Empty: they match. */
export function compareLessonShapes(vi: LessonShape, en: LessonShape): string[] {
  const diffs: string[] = [];
  const same = (what: string, a: unknown, b: unknown) => {
    if (a !== b) diffs.push(`${what}: vi ${String(a)}, en ${String(b)}`);
  };

  same('## headings', vi.h2, en.h2);
  same('### headings', vi.h3, en.h3);
  same('$$ display formulas', vi.displayMath, en.displayMath);

  const before = diffs.length;
  const names = [...new Set([...Object.keys(vi.components), ...Object.keys(en.components)])].sort();
  for (const name of names) same(`<${name}> tags`, vi.components[name] ?? 0, en.components[name] ?? 0);
  // Same counts but another order: a component moved to another section.
  if (diffs.length === before && vi.sequence.join() !== en.sequence.join()) {
    diffs.push(`component order: vi ${vi.sequence.join(', ')}; en ${en.sequence.join(', ')}`);
  }

  // Import order does not matter; anything but .vi.py -> .en.py does.
  const expected = vi.imports.map(toEnImport);
  for (const statement of missingFrom(expected, en.imports)) diffs.push(`import missing in en: ${statement}`);
  for (const statement of missingFrom(en.imports, expected)) diffs.push(`import only in en: ${statement}`);

  if (!vi.quiz || !en.quiz) {
    if (vi.quiz || en.quiz) same('quiz questions', vi.quiz?.length ?? 'none', en.quiz?.length ?? 'none');
  } else {
    same('quiz questions', vi.quiz.length, en.quiz.length);
    vi.quiz.forEach((question, index) => {
      const other = en.quiz?.[index];
      if (!other) return;
      same(`quiz question ${index + 1} options`, question.options, other.options);
      same(`quiz question ${index + 1} answer`, question.answer, other.answer);
    });
  }

  return diffs;
}

export function compareLessonPair(viSource: string, enSource: string): string[] {
  return compareLessonShapes(lessonShape(viSource), lessonShape(enSource));
}
