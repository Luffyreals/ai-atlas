// The lesson code of ml/classification-metrics copies the 20 patients of src/data/datasets/patients.ts
// (docs/architecture/viz/threshold.md): every .py file of the lesson that defines `y_true = np.array([…])` and
// `p = np.array([…])` must list the same numbers in the same order, in both locales. Not a "# dataset:" marker:
// PATIENTS is not x/y data (DATASETS feeds DatasetTable), so the two lines are found by their variable names.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PATIENTS } from '../../../src/data/datasets/patients';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/** The numbers of `<name> = np.array([…])` on one line, or null when the source has no such line. */
function arrayOf(source: string, name: string): number[] | null {
  const match = new RegExp(`^${name} = np\\.array\\(\\[([^\\]]*)\\]\\)`, 'm').exec(source);
  if (!match) return null;
  return (match[1] ?? '').split(',').map((item) => Number(item.trim()));
}

describe('arrayOf', () => {
  it('reads a one-line array and ignores other names', () => {
    expect(arrayOf('import numpy as np\np = np.array([0.5, 1, -2])  # note', 'p')).toEqual([0.5, 1, -2]);
    expect(arrayOf('pp = np.array([1])', 'p')).toBeNull();
  });
});

for (const lesson of PATIENTS.lessons) {
  const dir = join(ROOT, 'src/code', lesson);
  const files = readdirSync(dir).filter((file) => file.endsWith('.py'));
  const withData = files.filter((file) => arrayOf(readFileSync(join(dir, file), 'utf8'), 'y_true') !== null);

  describe(`src/code/${lesson}/ carries the 20 patients`, () => {
    it('in at least one cell, in both locales', () => {
      expect(withData.some((file) => file.endsWith('.vi.py'))).toBe(true);
      expect(withData.some((file) => file.endsWith('.en.py'))).toBe(true);
    });

    it.each(withData)('%s: y_true and p equal PATIENTS.y and PATIENTS.p', (file) => {
      const source = readFileSync(join(dir, file), 'utf8');
      expect(arrayOf(source, 'y_true')).toEqual([...PATIENTS.y]);
      expect(arrayOf(source, 'p')).toEqual([...PATIENTS.p]);
    });
  });
}
