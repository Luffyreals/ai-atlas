// axisText (src/lib/viz/axis.ts; docs/architecture/viz/, sections 4.5, 9.4.1; decision 50): the axis text the
// three VIZ wrappers share, with DatasetTable's rule for a quantity without a unit.
import { describe, expect, it } from 'vitest';
import { APARTMENTS } from '../../../src/data/datasets/apartments';
import { SINE_TRAIN } from '../../../src/data/datasets/sine';
import { axisText } from '../../../src/lib/viz/axis';

describe('axisText', () => {
  const area = { name: { vi: 'Diện tích', en: 'Floor area' }, unit: { vi: 'm²', en: 'm²' } };
  const count = { name: { vi: 'Số phòng', en: 'Rooms' }, unit: { vi: '', en: '' } };

  it('title = "name (unit)" in the asked locale', () => {
    expect(axisText(area, 'vi')).toEqual({ name: 'Diện tích', unit: 'm²', title: 'Diện tích (m²)' });
    expect(axisText(area, 'en')).toEqual({ name: 'Floor area', unit: 'm²', title: 'Floor area (m²)' });
  });

  it('title = the name alone when the unit is empty, never "name ()"', () => {
    expect(axisText(count, 'vi')).toEqual({ name: 'Số phòng', unit: '', title: 'Số phòng' });
  });

  it('gives the titles the VIZ show: x and y of the sine data, the apartments with units', () => {
    expect(axisText(SINE_TRAIN.x, 'vi').title).toBe('x');
    expect(axisText(SINE_TRAIN.y, 'en').title).toBe('y');
    for (const column of [APARTMENTS.x, APARTMENTS.y]) {
      expect(axisText(column, 'vi').title).toBe(`${column.name.vi} (${column.unit.vi})`);
    }
  });
});
