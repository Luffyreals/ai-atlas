import { describe, expect, it } from 'vitest';
import { PARTS } from '../../src/data/roadmap';
import type { Lesson, LessonId } from '../../src/data/roadmap';
import { buildSidebar, type SidebarGroup, type SidebarLink } from '../../src/lib/sidebar';

function lesson(id: LessonId, vi: 'planned' | 'published', en: 'planned' | 'published', extra: Partial<Lesson> = {}): Lesson {
  return { id, title: { vi: `vi ${id}`, en: `en ${id}` }, prerequisites: [], status: { vi, en }, ...extra };
}

describe('buildSidebar', () => {
  it('is empty while every lesson is planned', () => {
    expect(buildSidebar()).toEqual([]);
  });

  it('builds one group per part with lessons in roadmap order', () => {
    const sidebar = buildSidebar(PARTS, [
      lesson('ml/b', 'published', 'published'),
      lesson('ml/planned', 'planned', 'planned'),
      lesson('ml/a', 'published', 'planned'),
    ]);

    expect(sidebar).toHaveLength(1);
    const group = sidebar[0] as SidebarGroup;
    expect(group.label).toBe('Học máy');
    expect(group.translations.en).toBe('Machine Learning');

    const items = group.items as SidebarLink[];
    expect(items.map((item) => item.slug)).toEqual(['ml/b', 'ml/a']);
    for (const item of items) {
      expect(item.slug).not.toMatch(/^(vi|en)\//);
      expect(item.translations.en).toBeTruthy();
    }
  });

  it('includes a lesson published only in vi', () => {
    const sidebar = buildSidebar(PARTS, [lesson('ml/a', 'published', 'planned')]);
    const items = (sidebar[0] as SidebarGroup).items as SidebarLink[];
    expect(items).toEqual([{ slug: 'ml/a', label: 'vi ml/a', translations: { en: 'en ml/a' } }]);
  });

  it('keeps only non-empty llm sections', () => {
    const sidebar = buildSidebar(PARTS, [
      lesson('llm/x', 'published', 'planned', { section: 'build' }),
      lesson('llm/y', 'planned', 'planned', { section: 'apps' }),
    ]);
    const llm = sidebar[0] as SidebarGroup;
    expect(llm.translations.en).toBe('Large Language Models');
    expect(llm.items).toHaveLength(1);

    const build = llm.items[0] as SidebarGroup;
    expect(build.label).toBe('Xây dựng và huấn luyện LLM');
    expect(build.items.map((item) => (item as SidebarLink).slug)).toEqual(['llm/x']);
  });

  it('prefers shortTitle over title', () => {
    const sidebar = buildSidebar(PARTS, [
      lesson('ml/a', 'published', 'planned', { shortTitle: { vi: 'Ngắn', en: 'Short' } }),
    ]);
    const item = (sidebar[0] as SidebarGroup).items[0] as SidebarLink;
    expect(item.label).toBe('Ngắn');
    expect(item.translations.en).toBe('Short');
  });
});
