import { describe, expect, it } from 'vitest';
import { toScriptJson } from '../../../src/lib/script-json';

// RoadmapMap embeds its graph with set:html in <script type="application/json">.
describe('toScriptJson', () => {
  it('escapes every "<", so "</script>" and "<!--" cannot end the element', () => {
    const json = toScriptJson({ title: '</script><script>alert(1)</script>', note: '<!-- x' });
    expect(json).not.toContain('<');
    expect(json).toContain(String.raw`\u003c/script>`);
  });

  it('parses back to the same value', () => {
    const value = { prerequisites: { 'ml/a': ['math/b'] }, partTitles: { ml: 'a < b' }, partOrder: ['ml'] };
    expect(JSON.parse(toScriptJson(value))).toEqual(value);
  });
});
