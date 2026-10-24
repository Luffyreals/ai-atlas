// Box-and-arrow helpers of static figures (docs/architecture/llm-lessons.md, section 2.9.1): hand-worked
// examples for anchor, centre, spread and mainAndSmall.
import { describe, expect, it } from 'vitest';
import { anchor, centre, mainAndSmall, spread, type Box } from '../../src/lib/figures/layout';

const box: Box = { x: 8, y: 52, width: 116, height: 40 };

describe('anchor', () => {
  it('gives the middle of each side by default', () => {
    expect(anchor(box, 'top')).toEqual([66, 52]);
    expect(anchor(box, 'bottom')).toEqual([66, 92]);
    expect(anchor(box, 'left')).toEqual([8, 72]);
    expect(anchor(box, 'right')).toEqual([124, 72]);
  });

  it('moves along the side with `at`, rounded to 1 decimal', () => {
    expect(anchor(box, 'top', 0)).toEqual([8, 52]);
    expect(anchor(box, 'bottom', 1)).toEqual([124, 92]);
    expect(anchor(box, 'right', 0.35)).toEqual([124, 66]);
    expect(anchor({ x: 0, y: 0, width: 10, height: 10 }, 'left', 1 / 3)).toEqual([0, 3.3]);
  });

  it('rejects `at` outside [0, 1]', () => {
    expect(() => anchor(box, 'top', 1.2)).toThrow(/\[0, 1\]/);
    expect(() => anchor(box, 'top', -0.1)).toThrow();
  });
});

describe('centre', () => {
  it('is the middle of the box', () => {
    expect(centre(box)).toEqual([66, 72]);
    expect(centre({ x: 0, y: 0, width: 5, height: 3 })).toEqual([2.5, 1.5]);
  });
});

describe('spread', () => {
  it('fills a span with equal slots and fixed gaps', () => {
    expect(spread(8, 352, 3, 16)).toEqual({ starts: [8, 128, 248], size: 104 });
    expect(spread(8, 352, 2, 16)).toEqual({ starts: [8, 188], size: 164 });
    expect(spread(0, 100, 1, 40)).toEqual({ starts: [0], size: 100 });
  });

  it('rejects slots that do not fit and a count that is not a positive integer', () => {
    expect(() => spread(0, 30, 3, 20)).toThrow(/do not fit/);
    expect(() => spread(0, 100, 0, 10)).toThrow(/positive integer/);
    expect(() => spread(0, 100, 1.5, 10)).toThrow(/positive integer/);
  });
});

describe('mainAndSmall', () => {
  it('takes the first line as the main line and the rest as small lines', () => {
    expect(mainAndSmall(['Ghép prompt', 'chỉ dẫn', 'câu hỏi'])).toEqual({ lines: 'Ghép prompt', small: ['chỉ dẫn', 'câu hỏi'] });
    expect(mainAndSmall('Câu hỏi')).toEqual({ lines: 'Câu hỏi', small: [] });
  });
});
