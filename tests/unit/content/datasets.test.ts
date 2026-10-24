// Shared lesson datasets (docs/architecture/viz/, sections 2.5, 4.1, 6 task V0):
// - every dataset in DATASETS is well formed;
// - the lesson code under src/code/ carries the same numbers, right under "# dataset: <id>".
// The .py reader is a pure function over a string, tested first on in-memory sources.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DATASETS } from '../../../src/data/datasets/index';
import type { Row, XYDataset } from '../../../src/data/datasets/types';
import { LOCALES, type Localized } from '../../../src/data/roadmap';
import { getLesson } from '../../../src/lib/roadmap';
import { decimalsOf } from '../../../src/lib/viz/format';

const CODE_DIR = fileURLToPath(new URL('../../../src/code/', import.meta.url));

/** The part of a dataset the .py check needs. */
interface PythonDataset {
  id: string;
  x: { python: string };
  y: { python: string };
  rows: readonly Row[];
}

interface PythonCheck {
  /** Ids named by well-formed markers, in file order. */
  markers: string[];
  /** "<file>:<line>: <what is wrong>", one per problem. */
  errors: string[];
}

// Anything that looks like a marker is checked, so "#dataset: x" or "# Dataset: x" are not silently skipped.
const MARKER_LIKE = /^\s*#\s*dataset\s*:/i;
const MARKER = /^\s*# dataset: (\S+)$/;
// One array on one line; a trailing comment is allowed.
const ARRAY_LINE = /^\s*([A-Za-z_]\w*)\s*=\s*np\.array\(\[([^\]]*)\]\)\s*(?:#.*)?$/;
const NUMBER = /^-?\d+(?:\.\d+)?$/;
const FORMAT_HINT = '"# dataset: <id>", then "<x> = np.array([...])" and "<y> = np.array([...])", one line each';

/** Checks the data lines under every "# dataset: <id>" marker of one Python source. */
function checkPythonDatasets(
  file: string,
  source: string,
  datasets: Readonly<Record<string, PythonDataset>>,
): PythonCheck {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const markers: string[] = [];
  const errors: string[] = [];
  const at = (index: number, message: string) => errors.push(`${file}:${index + 1}: ${message}`);

  const checkArray = (index: number, marker: string, dataset: PythonDataset, column: 0 | 1) => {
    const name = column === 0 ? dataset.x.python : dataset.y.python;
    const text = lines[index];
    const expected = `${name} = np.array([...])`;
    if (text === undefined || text.trim() === '') {
      at(index, `missing "${expected}" right after line ${index - column} ("${marker}"). Format: ${FORMAT_HINT}`);
      return;
    }
    const match = ARRAY_LINE.exec(text);
    if (!match) {
      at(index, `expected "${expected}" on one line, numbers only; found "${text.trim()}". Format: ${FORMAT_HINT}`);
      return;
    }
    const [, variable = '', list = ''] = match;
    if (variable !== name) {
      at(index, `expected the variable "${name}" (dataset "${dataset.id}"), found "${variable}"`);
      return;
    }
    const items = list.split(',').map((item) => item.trim());
    const bad = items.filter((item) => !NUMBER.test(item));
    if (bad.length > 0) {
      at(index, `${name}: not a plain number: ${bad.map((item) => `"${item}"`).join(', ')}`);
      return;
    }
    if (items.length !== dataset.rows.length) {
      at(index, `${name} has ${items.length} numbers, dataset "${dataset.id}" has ${dataset.rows.length} rows`);
      return;
    }
    items.forEach((item, i) => {
      const value = dataset.rows[i]?.[column];
      if (Number(item) !== value) {
        at(index, `${name}[${i}] is ${item}, dataset "${dataset.id}" has ${String(value)} (rows[${i}][${column}])`);
      }
    });
  };

  lines.forEach((line, index) => {
    if (!MARKER_LIKE.test(line)) return;
    const id = MARKER.exec(line.trimEnd())?.[1];
    if (!id) {
      at(index, `write the marker exactly as "# dataset: <id>"; found "${line.trim()}"`);
      return;
    }
    const dataset = Object.hasOwn(datasets, id) ? datasets[id] : undefined;
    if (!dataset) {
      const known = Object.keys(datasets).join(', ') || 'none';
      at(index, `"# dataset: ${id}" names an unknown dataset (known: ${known}; src/data/datasets/index.ts)`);
      return;
    }
    markers.push(id);
    checkArray(index + 1, line.trim(), dataset, 0);
    checkArray(index + 2, line.trim(), dataset, 1);
  });

  return { markers, errors };
}

/** Paths relative to src/code/, with "/" separators. */
function listPythonFiles(): string[] {
  return readdirSync(CODE_DIR, { recursive: true, encoding: 'utf8' })
    .map((file) => file.split('\\').join('/'))
    .filter((file) => file.endsWith('.py'));
}

describe('checkPythonDatasets (in-memory sources)', () => {
  const SAMPLE: Record<string, PythonDataset> = {
    sample: { id: 'sample', x: { python: 'area' }, y: { python: 'rent' }, rows: [[25, 6.7], [30, -6.5], [36, 12]] },
  };
  const GOOD = [
    'import numpy as np',
    '',
    '# dataset: sample',
    'area = np.array([25, 30, 36])  # m²',
    'rent = np.array([6.7, -6.5, 12.0])',
    'area_out = np.append(area, 110)',
  ];
  const check = (lines: string[], datasets: Record<string, PythonDataset> = SAMPLE) =>
    checkPythonDatasets('demo.vi.py', lines.join('\n'), datasets);

  it('accepts the format: same numbers, same order, trailing comments, 12.0 for 12, CRLF', () => {
    expect(check(GOOD)).toEqual({ markers: ['sample'], errors: [] });
    expect(checkPythonDatasets('demo.vi.py', GOOD.join('\r\n'), SAMPLE).errors).toEqual([]);
    expect(check(['def f():', '    # dataset: sample', '    area = np.array([25,30,36])', '    rent = np.array([ 6.7 , -6.5, 12 ])']).errors).toEqual([]);
  });

  it('reports one number off, with file and line', () => {
    const lines = [...GOOD];
    lines[4] = 'rent = np.array([6.7, -6.5, 12.1])';
    expect(check(lines).errors).toEqual(['demo.vi.py:5: rent[2] is 12.1, dataset "sample" has 12 (rows[2][1])']);
  });

  it('reports a missing number or an extra one', () => {
    const lines = [...GOOD];
    lines[3] = 'area = np.array([25, 30])';
    expect(check(lines).errors).toEqual(['demo.vi.py:4: area has 2 numbers, dataset "sample" has 3 rows']);
  });

  it('reports a missing line', () => {
    const lines = GOOD.slice(0, 4);
    expect(check(lines).errors).toEqual([
      expect.stringMatching(/^demo\.vi\.py:5: missing "rent = np\.array\(\[\.\.\.\]\)" right after line 3/),
    ]);
    const blank = [...GOOD];
    blank.splice(3, 0, '');
    expect(check(blank).errors[0]).toMatch(/^demo\.vi\.py:4: missing "area = np\.array/);
  });

  it('reports a wrong variable name', () => {
    const lines = [...GOOD];
    lines[3] = 'size = np.array([25, 30, 36])';
    expect(check(lines).errors).toEqual(['demo.vi.py:4: expected the variable "area" (dataset "sample"), found "size"']);
  });

  it('reports an array split over lines, or something that is not a plain number', () => {
    const split = [...GOOD];
    split[3] = 'area = np.array([25, 30,';
    expect(check(split).errors[0]).toMatch(/^demo\.vi\.py:4: expected "area = np\.array\(\[\.\.\.\]\)" on one line/);
    const expression = [...GOOD];
    expression[3] = 'area = np.array([25, 30, 6 * 6])';
    expect(check(expression).errors).toEqual(['demo.vi.py:4: area: not a plain number: "6 * 6"']);
  });

  it('reports a marker naming an unknown dataset, or a badly written marker', () => {
    const unknown = [...GOOD];
    unknown[2] = '# dataset: houses';
    expect(check(unknown).errors).toEqual([
      'demo.vi.py:3: "# dataset: houses" names an unknown dataset (known: sample; src/data/datasets/index.ts)',
    ]);
    const sloppy = [...GOOD];
    sloppy[2] = '#dataset: sample';
    expect(check(sloppy).errors[0]).toMatch(/^demo\.vi\.py:3: write the marker exactly as "# dataset: <id>"/);
  });

  it('works with an empty registry: no marker, no error; any marker is unknown', () => {
    expect(check(['import numpy as np', 'x = np.array([1, 2])'], {})).toEqual({ markers: [], errors: [] });
    expect(check(GOOD, {}).errors).toEqual([
      'demo.vi.py:3: "# dataset: sample" names an unknown dataset (known: none; src/data/datasets/index.ts)',
    ]);
  });
});

/**
 * A unit is '' in every locale (a quantity without a unit, e.g. x and y of the sine data; viz/poly-fit.md, section 9.4.1)
 * or a real text in every locale. Empty in one locale only, or only spaces, is a mistake.
 */
function unitProblem(where: string, unit: Localized): string | null {
  if (LOCALES.every((locale) => unit[locale] === '')) return null;
  const empty = LOCALES.filter((locale) => unit[locale].trim() === '');
  if (empty.length === 0) return null;
  return `${where}: blank in ${empty.join(', ')}; write the unit in every locale, or '' in every locale`;
}

describe('unitProblem (in-memory units)', () => {
  it("accepts a unit in every locale, or '' in every locale", () => {
    expect(unitProblem('demo.x.unit', { vi: 'm²', en: 'm²' })).toBeNull();
    expect(unitProblem('demo.x.unit', { vi: 'triệu đồng', en: 'million VND' })).toBeNull();
    expect(unitProblem('demo.x.unit', { vi: '', en: '' })).toBeNull();
  });

  it('reports a unit empty in one locale only, or made of spaces', () => {
    expect(unitProblem('demo.x.unit', { vi: '', en: 'm²' })).toBe(
      "demo.x.unit: blank in vi; write the unit in every locale, or '' in every locale",
    );
    expect(unitProblem('demo.y.unit', { vi: 'm²', en: '' })).toMatch(/^demo\.y\.unit: blank in en;/);
    expect(unitProblem('demo.y.unit', { vi: ' ', en: '' })).toMatch(/^demo\.y\.unit: blank in vi, en;/);
    expect(unitProblem('demo.y.unit', { vi: ' ', en: ' ' })).toMatch(/blank in vi, en;/);
  });
});

const ENTRIES = Object.entries(DATASETS) as [string, XYDataset][];
const PYTHON_NAME = /^[A-Za-z_]\w*$/;

describe.skipIf(ENTRIES.length === 0)('DATASETS', () => {
  it.each(ENTRIES)('%s is well formed', (key, dataset) => {
    expect(dataset.id).toBe(key);
    expect(dataset.rows.length).toBeGreaterThan(0);
    for (const locale of LOCALES) {
      for (const text of [dataset.caption, dataset.itemLabel, dataset.description, dataset.x.name, dataset.y.name]) {
        expect(text[locale].trim(), `${key}: empty ${locale} text`).not.toBe('');
      }
    }
    expect(unitProblem(`${key}.x.unit`, dataset.x.unit)).toBeNull();
    expect(unitProblem(`${key}.y.unit`, dataset.y.unit)).toBeNull();
    for (const column of [dataset.x, dataset.y]) {
      expect(column.python).toMatch(PYTHON_NAME);
      expect(Number.isInteger(column.digits) && column.digits >= 0).toBe(true);
    }
    expect(dataset.x.python).not.toBe(dataset.y.python);
    dataset.rows.forEach((row, i) => {
      expect(row, `${key}.rows[${i}]`).toHaveLength(2);
      row.forEach((value, column) => {
        const digits = (column === 0 ? dataset.x : dataset.y).digits;
        expect(Number.isFinite(value), `${key}.rows[${i}][${column}] is finite`).toBe(true);
        // The table prints `digits` decimals: a value with more would be rounded without a word.
        expect(decimalsOf(value), `${key}.rows[${i}][${column}] = ${value} has at most ${digits} decimals`).toBeLessThanOrEqual(digits);
      });
    });
  });

  it.each(ENTRIES)('%s lists lessons that exist in the roadmap', (key, dataset) => {
    expect(dataset.lessons.length, key).toBeGreaterThan(0);
    for (const id of dataset.lessons) expect(getLesson(id), `${key}: unknown lesson ${id}`).toBeDefined();
  });
});

describe('src/code/ carries the dataset numbers', () => {
  const files = listPythonFiles();
  const results = files.map((file) => ({
    file,
    ...checkPythonDatasets(`src/code/${file}`, readFileSync(join(CODE_DIR, file), 'utf8'), DATASETS),
  }));

  it('has Python files to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  // Every file on its own, .vi.py and .en.py: code-pairs.test.ts skips comments, so it does not see markers.
  it.each(results.map((result) => [result.file, result] as const))('%s', (_file, result) => {
    expect(result.errors).toEqual([]);
  });

  const published = ENTRIES.flatMap(([key, dataset]) =>
    dataset.lessons.filter((id) => getLesson(id)?.status.vi === 'published').map((id) => [key, id] as const),
  );
  if (published.length === 0) {
    it.skip('no published lesson uses a dataset yet', () => {});
  } else {
    it.each(published)('dataset %s: the published lesson %s has a .vi.py with its marker', (key, lessonId) => {
      const withMarker = results.filter(
        (result) =>
          result.file.startsWith(`${lessonId}/`) && result.file.endsWith('.vi.py') && result.markers.includes(key),
      );
      expect(
        withMarker.map((result) => result.file),
        `src/code/${lessonId}/*.vi.py with "# dataset: ${key}"`,
      ).not.toEqual([]);
    });
  }
});
