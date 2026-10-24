import { describe, expect, it } from 'vitest';
import { LESSONS, PARTS } from '../../../src/data/roadmap';
import type { Lesson, LessonId } from '../../../src/data/roadmap';
import { getPartIdOf, hasPage, requireLesson } from '../../../src/lib/roadmap';
import { buildSidebar, type SidebarGroup, type SidebarLink } from '../../../src/lib/sidebar';

function lesson(id: LessonId, vi: 'planned' | 'published', en: 'planned' | 'published', extra: Partial<Lesson> = {}): Lesson {
  return { id, title: { vi: `vi ${id}`, en: `en ${id}` }, prerequisites: [], status: { vi, en }, ...extra };
}

/** Every link of a sidebar, sections included, in display order. */
function linksOf(items: readonly (SidebarLink | SidebarGroup)[]): SidebarLink[] {
  return items.flatMap((item) => ('slug' in item ? [item] : linksOf(item.items)));
}

// The real roadmap: expectations come from LESSONS, so they hold while every lesson is planned (empty
// sidebar, docs/architecture/scaffold.md 2.4) and once lessons get a vi page.
describe('buildSidebar with the real roadmap', () => {
  const withPage = LESSONS.filter(hasPage);

  it('links exactly the lessons with status.vi "published", in roadmap order', () => {
    expect(linksOf(buildSidebar()).map((link) => link.slug)).toEqual(withPage.map((l) => l.id));
  });

  it('labels each link with shortTitle ?? title, vi as label and en in translations', () => {
    for (const link of linksOf(buildSidebar())) {
      const text = requireLesson(link.slug).shortTitle ?? requireLesson(link.slug).title;
      expect(link).toEqual({ slug: link.slug, label: text.vi, translations: { en: text.en } });
    }
  });

  it('has one group per part that has a page, in part order, and no empty group', () => {
    const sidebar = buildSidebar();
    const partsWithPage = PARTS.filter((part) => withPage.some((l) => getPartIdOf(l.id) === part.id));
    expect(sidebar.map((group) => group.label)).toEqual(partsWithPage.map((part) => part.title.vi));
    expect(sidebar.map((group) => group.translations.en)).toEqual(partsWithPage.map((part) => part.title.en));
    const empty = (group: SidebarGroup): boolean =>
      group.items.length === 0 || group.items.some((item) => !('slug' in item) && empty(item));
    expect(sidebar.filter(empty)).toEqual([]);
  });
});

describe('buildSidebar', () => {
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

  it('is empty when every lesson is planned', () => {
    expect(buildSidebar(PARTS, LESSONS.map((l) => ({ ...l, status: { vi: 'planned', en: 'planned' } })))).toEqual([]);
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
    // linksOf() (used on the real roadmap above) reaches links inside sections.
    expect(linksOf(sidebar).map((link) => link.slug)).toEqual(['llm/x']);
  });

  it('orders groups by PARTS and llm sections by PARTS.sections, whatever the input order', () => {
    const sidebar = buildSidebar(PARTS, [
      lesson('llm/build1', 'published', 'planned', { section: 'build' }),
      lesson('ml/m', 'published', 'planned'),
      lesson('llm/apps1', 'published', 'planned', { section: 'apps' }),
      lesson('python/p', 'published', 'planned'),
    ]);
    expect(sidebar.map((group) => group.translations.en)).toEqual(['Python', 'Machine Learning', 'Large Language Models']);
    expect(linksOf(sidebar).map((link) => link.slug)).toEqual(['python/p', 'ml/m', 'llm/apps1', 'llm/build1']);
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
