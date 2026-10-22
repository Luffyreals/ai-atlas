import { describe, expect, it } from 'vitest';
import { formatString } from '../../src/i18n/format';

describe('formatString', () => {
  it('fills {{name}} placeholders', () => {
    expect(formatString('{{count}} bài', { count: 7 })).toBe('7 bài');
    expect(
      formatString('Đường tới {{lesson}}: {{count}} bài, qua {{parts}} phần.', {
        lesson: 'Hồi quy tuyến tính',
        count: 8,
        parts: 3,
      }),
    ).toBe('Đường tới Hồi quy tuyến tính: 8 bài, qua 3 phần.');
  });

  it('fills every occurrence of the same placeholder', () => {
    expect(formatString('{{a}}-{{a}}', { a: 'x' })).toBe('x-x');
  });

  it('writes 0 and empty strings instead of keeping the placeholder', () => {
    expect(formatString('{{count}} lessons', { count: 0 })).toBe('0 lessons');
    expect(formatString('[{{x}}]', { x: '' })).toBe('[]');
  });

  it('keeps unknown placeholders', () => {
    expect(formatString('{{count}} of {{total}}', { count: 1 })).toBe('1 of {{total}}');
    expect(formatString('{{missing}}', {})).toBe('{{missing}}');
  });

  it('keeps placeholders named like Object.prototype members when they are not given', () => {
    // A template is data (translators write it); only the caller's own keys may fill it.
    expect(formatString('{{constructor}}', {})).toBe('{{constructor}}');
    expect(formatString('{{toString}}', { count: 1 })).toBe('{{toString}}');
  });

  it('tolerates spaces inside the braces', () => {
    expect(formatString('{{ name }} and {{name}} and {{  name}}', { name: 'Ada' })).toBe('Ada and Ada and Ada');
  });

  it('inserts values literally (no $& or $1 replacement patterns)', () => {
    expect(formatString('{{x}}', { x: '$& $1 $$' })).toBe('$& $1 $$');
  });

  it('does not re-expand placeholders that appear inside a value', () => {
    expect(formatString('{{a}} {{b}}', { a: '{{b}}', b: 'B' })).toBe('{{b}} B');
  });

  it('leaves text without placeholders and single braces alone', () => {
    expect(formatString('no {placeholder} here', { placeholder: 'x' })).toBe('no {placeholder} here');
  });
});
