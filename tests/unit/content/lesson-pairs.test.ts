// A lesson published in vi and en has the same structure in both files (CLAUDE.md, "Quy tắc nội dung"):
// same ## and ### headings, $$ formulas, component tags in the same order, imports that differ only in
// .vi.py -> .en.py, and the same quiz shape and answers. The comparison lives in tests/unit/fixtures/lesson-shape.ts.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../../src/data/roadmap';
import type { Locale } from '../../../src/data/roadmap';
import { hasPage, isTranslated } from '../../../src/lib/roadmap';
import { compareLessonPair, lessonShape, otherLanguageImports, splitMdx } from '../fixtures/lesson-shape';

const DOCS_DIR = fileURLToPath(new URL('../../../src/content/docs/', import.meta.url));

function lessonFile(locale: Locale, id: string): string {
  const file = ['.mdx', '.md'].map((ext) => join(DOCS_DIR, locale, id + ext)).find((path) => existsSync(path));
  if (!file) throw new Error(`no file for ${locale}/${id}`);
  return file;
}

const read = (locale: Locale, id: string) => readFileSync(lessonFile(locale, id), 'utf8');

// Fixtures. String.raw keeps "\" of LaTeX as is; ${TICK} and ${FENCE} put in the backticks.
const TICK = '`';
const FENCE = '```';

const VI = String.raw`---
title: Hồi quy tuyến tính
description: Bài mẫu cho test.
quiz:
  - question: 'Với $\hat{y} = 3$ và $y = 2$, sai số $\frac{1}{2}(\hat{y} - y)^2$ bằng bao nhiêu?'
    options: ['$1$', '$\frac{1}{2}$', '$2$']
    answer: 1
    explanation: 'Hiệu bằng $1$, nhân $\frac{1}{2}$ được $\frac{1}{2}$.'
  - question: 'Hồi quy tuyến tính dự đoán gì?'
    options:
      - 'Một số thực'
      - 'Một nhãn'
    answer: 0
    explanation: 'Đầu ra là một số thực.'
---

import Prerequisites from '@components/Prerequisites.astro';
import PythonRunner from '@components/PythonRunner.astro';
import Quiz from '@components/Quiz.astro';
import LessonProgress from '@components/LessonProgress.astro';
import LineFit from '@components/viz/LineFit.astro';
import fitCode from '@code/ml/linear-regression/fit.vi.py?raw';

## Mục tiêu

Hiểu vì sao $\hat{y}$ là một đường thẳng.

## Cần biết trước

<Prerequisites />

## Lý thuyết

### Phát biểu bài toán

$$
\hat{y} = \mathbf{w}^\top \mathbf{x} + b
$$

### Hàm mất mát

$$
\mathcal{L} = \frac{1}{m} \sum_{i=1}^{m} \left( \hat{y}^{(i)} - y^{(i)} \right)^2
$$

## Minh họa

<LineFit />

## Ví dụ code

${FENCE}python
## không phải heading
import numpy as np
print("$$")  # <Quiz />
${FENCE}

<PythonRunner code={fitCode} />

Chuỗi ${TICK}$$ <Quiz />${TICK} trong code cũng không phải công thức.

{/* <PythonRunner code={other} />
## cũng không phải heading */}

## Kiểm tra nhanh

<Quiz />

## Tóm tắt và đọc thêm

<LessonProgress />
`;

const EN = String.raw`---
title: Linear Regression
description: Sample lesson for the tests.
quiz:
  - question: 'With $\hat{y} = 3$ and $y = 2$, what is the error $\frac{1}{2}(\hat{y} - y)^2$?'
    options: ['$1$', '$\frac{1}{2}$', '$2$']
    answer: 1
    explanation: 'The difference is $1$; times $\frac{1}{2}$ that gives $\frac{1}{2}$.'
  - question: 'What does linear regression predict?'
    options:
      - 'A real number'
      - 'A label'
    answer: 0
    explanation: 'The output is a real number.'
---

import Prerequisites from '@components/Prerequisites.astro';
import PythonRunner from '@components/PythonRunner.astro';
import Quiz from '@components/Quiz.astro';
import LessonProgress from '@components/LessonProgress.astro';
import LineFit from '@components/viz/LineFit.astro';
import fitCode from '@code/ml/linear-regression/fit.en.py?raw';

## Goals

Understand why $\hat{y}$ is a straight line.

## Before this lesson

<Prerequisites />

## Theory

### The problem

$$
\hat{y} = \mathbf{w}^\top \mathbf{x} + b
$$

### Loss function

$$
\mathcal{L} = \frac{1}{m} \sum_{i=1}^{m} \left( \hat{y}^{(i)} - y^{(i)} \right)^2
$$

## Illustration

<LineFit />

## Code example

${FENCE}python
## not a heading
import numpy as np
print("$$")  # <Quiz />
${FENCE}

<PythonRunner code={fitCode} />

The string ${TICK}$$ <Quiz />${TICK} in code is not a formula either.

{/* <PythonRunner code={other} />
## not a heading either */}

## Quick check

<Quiz />

## Summary and further reading

<LessonProgress />
`;

const FIT_VI = "import fitCode from '@code/ml/linear-regression/fit.vi.py?raw'";
const FIT_EN = "import fitCode from '@code/ml/linear-regression/fit.en.py?raw'";
const LOSS_EN = String.raw`### Loss function

$$
\mathcal{L} = \frac{1}{m} \sum_{i=1}^{m} \left( \hat{y}^{(i)} - y^{(i)} \right)^2
$$
`;

describe('lessonShape', () => {
  it('reads headings, formulas, components, imports and quiz, skipping code and comments', () => {
    expect(lessonShape(VI)).toEqual({
      h2: 7,
      h3: 2,
      displayMath: 2,
      hasMath: true,
      components: { Prerequisites: 1, PythonRunner: 1, Quiz: 1, LessonProgress: 1, LineFit: 1 },
      sequence: ['Prerequisites', 'LineFit', 'PythonRunner', 'Quiz', 'LessonProgress'],
      imports: [
        "import Prerequisites from '@components/Prerequisites.astro'",
        "import PythonRunner from '@components/PythonRunner.astro'",
        "import Quiz from '@components/Quiz.astro'",
        "import LessonProgress from '@components/LessonProgress.astro'",
        "import LineFit from '@components/viz/LineFit.astro'",
        FIT_VI,
      ],
      quiz: [
        { options: 3, answer: 1 },
        { options: 2, answer: 0 },
      ],
    });
  });

  it('parses the frontmatter like Astro: "\\" in single quotes stays', () => {
    const quiz = splitMdx(VI).data.quiz as { options: string[] }[];
    expect(quiz[0]?.options[1]).toBe(String.raw`$\frac{1}{2}$`);
  });

  it('skips ~~~ fences and a ``` fence nested in a longer one', () => {
    const source = ['## A', '~~~', '## no', '~~~', '````md', FENCE, '## no', FENCE, '````', '### B', '<Quiz />'].join('\n');
    expect(lessonShape(source)).toMatchObject({ h2: 1, h3: 1, sequence: ['Quiz'] });
  });

  it('normalises multi-line and named imports', () => {
    const source = "import {\n  Aside,\n  Tabs as T\n} from '@astrojs/starlight/components';\nimport \"./x.css\";\n";
    expect(lessonShape(source).imports).toEqual([
      "import { Aside, Tabs as T } from '@astrojs/starlight/components'",
      "import './x.css'",
    ]);
  });

  it('counts a lesson with no math, no quiz and no components as such', () => {
    expect(lessonShape('---\ntitle: X\n---\n\nPrice: \\$5.\n')).toEqual({
      h2: 0,
      h3: 0,
      displayMath: 0,
      hasMath: false,
      components: { Prerequisites: 0, PythonRunner: 0, Quiz: 0, LessonProgress: 0 },
      sequence: [],
      imports: [],
      quiz: undefined,
    });
  });
});

describe('compareLessonPair on fixtures', () => {
  it('finds nothing to report in a matching pair', () => {
    expect(compareLessonPair(VI, EN)).toEqual([]);
  });

  // Each case breaks EN in one way; the comparison must report exactly that.
  const cases: [string, (en: string) => string, string[]][] = [
    ['a ## heading dropped', (en) => en.replace('## Illustration\n\n', ''), ['## headings: vi 7, en 6']],
    [
      'a ### heading turned into ##',
      (en) => en.replace('### Loss function', '## Loss function'),
      ['## headings: vi 7, en 8', '### headings: vi 2, en 1'],
    ],
    [
      'a $$ formula dropped',
      (en) => en.replace(LOSS_EN, '### Loss function\n'),
      ['$$ display formulas: vi 2, en 1'],
    ],
    [
      'an unclosed $$',
      (en) => en.replace('+ b\n$$\n', '+ b\n'),
      ['$$ display formulas: vi 2, en 1.5'],
    ],
    ['a PythonRunner dropped', (en) => en.replace('<PythonRunner code={fitCode} />', ''), ['<PythonRunner> tags: vi 1, en 0']],
    ['the viz component dropped', (en) => en.replace('<LineFit />', ''), ['<LineFit> tags: vi 1, en 0']],
    [
      'a second Prerequisites',
      (en) => en.replace('<LineFit />', '<LineFit />\n\n<Prerequisites ids={[]} />'),
      ['<Prerequisites> tags: vi 1, en 2'],
    ],
    [
      'a component moved to another section',
      (en) => en.replace('<PythonRunner code={fitCode} />', '<Quiz />').replace('## Quick check\n\n<Quiz />', '## Quick check\n\n<PythonRunner code={fitCode} />'),
      [
        'component order: vi Prerequisites, LineFit, PythonRunner, Quiz, LessonProgress; ' +
          'en Prerequisites, LineFit, Quiz, PythonRunner, LessonProgress',
      ],
    ],
    [
      'the en file imports the vi code',
      (en) => en.replace('fit.en.py', 'fit.vi.py'),
      [`import missing in en: ${FIT_EN}`, `import only in en: ${FIT_VI}`],
    ],
    [
      'an import dropped',
      (en) => en.replace("import LineFit from '@components/viz/LineFit.astro';\n", ''),
      ["import missing in en: import LineFit from '@components/viz/LineFit.astro'"],
    ],
    [
      'another viz component imported',
      (en) => en.replace('viz/LineFit.astro', 'viz/LossCurve.astro'),
      [
        "import missing in en: import LineFit from '@components/viz/LineFit.astro'",
        "import only in en: import LineFit from '@components/viz/LossCurve.astro'",
      ],
    ],
    ['a quiz answer changed', (en) => en.replace('answer: 0', 'answer: 1'), ['quiz question 2 answer: vi 0, en 1']],
    [
      'a quiz option dropped',
      // A function, since "$'" in a replacement string means "the text after the match".
      (en) => en.replace(String.raw`['$1$', '$\frac{1}{2}$', '$2$']`, () => String.raw`['$1$', '$\frac{1}{2}$']`),
      ['quiz question 1 options: vi 3, en 2'],
    ],
    [
      'a quiz question dropped',
      (en) => en.replace(/ {2}- question: 'What does[\s\S]*?real number\.'\n/, ''),
      ['quiz questions: vi 2, en 1'],
    ],
    ['no quiz in en', (en) => en.replace(/^quiz:\n[\s\S]*?(?=^---$)/m, ''), ['quiz questions: vi 2, en none']],
  ];

  it.each(cases)('reports %s', (_name, mutate, expected) => {
    const broken = mutate(EN);
    expect(broken, 'the fixture edit did not apply').not.toBe(EN);
    expect(compareLessonPair(VI, broken)).toEqual(expected);
  });

  it('import order does not matter', () => {
    const swapped = EN.replace(
      "import Quiz from '@components/Quiz.astro';\nimport LessonProgress from '@components/LessonProgress.astro';",
      "import LessonProgress from '@components/LessonProgress.astro';\nimport Quiz from '@components/Quiz.astro';",
    );
    expect(swapped).not.toBe(EN);
    expect(compareLessonPair(VI, swapped)).toEqual([]);
  });
});

describe('otherLanguageImports on fixtures', () => {
  it('accepts each file importing its own language', () => {
    expect(otherLanguageImports(lessonShape(VI), 'vi')).toEqual([]);
    expect(otherLanguageImports(lessonShape(EN), 'en')).toEqual([]);
  });

  it('flags code written for the other language', () => {
    expect(otherLanguageImports(lessonShape(EN), 'vi')).toEqual([FIT_EN]);
    expect(otherLanguageImports(lessonShape(VI), 'en')).toEqual([FIT_VI]);
  });
});

// Real files. dev/components is not a lesson, but it is a vi/en pair built the same way: a control that the
// parser reads real MDX, so this suite never passes only because no lesson is translated yet.
const PAIRS = LESSONS.filter((lesson) => isTranslated(lesson, 'vi') && isTranslated(lesson, 'en')).map((l) => l.id);
const DEMO = 'dev/components';

describe('vi and en files of the same page', () => {
  it(`${DEMO} (control): the parser sees its real structure, and vi and en match`, () => {
    const shape = lessonShape(read('vi', DEMO));
    expect(shape.components).toMatchObject({ Prerequisites: 2, PythonRunner: 5, Quiz: 2, LessonProgress: 1, RoadmapMap: 1 });
    expect(shape.imports).toHaveLength(10);
    expect(shape.quiz).toHaveLength(3);
    expect(shape.displayMath).toBe(1);
    expect(compareLessonPair(read('vi', DEMO), read('en', DEMO))).toEqual([]);
  });

  if (PAIRS.length === 0) it.skip('no lesson is published in both vi and en yet', () => {});
  else {
    it.each(PAIRS)('%s: vi and en have the same structure', (id) => {
      expect(compareLessonPair(read('vi', id), read('en', id))).toEqual([]);
    });
  }
});

describe('every published page imports the code of its own language', () => {
  const pages: [Locale, string][] = [
    ['vi', DEMO],
    ['en', DEMO],
    ...LESSONS.filter(hasPage).map((lesson): [Locale, string] => ['vi', lesson.id]),
    ...LESSONS.filter((lesson) => isTranslated(lesson, 'en')).map((lesson): [Locale, string] => ['en', lesson.id]),
  ];

  it.each(pages)('%s/%s', (locale, id) => {
    expect(otherLanguageImports(lessonShape(read(locale, id)), locale)).toEqual([]);
  });
});
