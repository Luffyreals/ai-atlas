// Builds the Starlight sidebar from the roadmap.
// Imported by astro.config.ts: relative imports only, never `astro:*`.
import { LESSONS, PARTS } from '../data/roadmap';
import type { Lesson, Localized, Part } from '../data/roadmap';
import { getPartIdOf, hasPage } from './roadmap';

export interface SidebarLink {
  slug: string; // no locale prefix: Starlight adds /vi/ or /en/
  label: string;
  translations: { en: string };
}

export interface SidebarGroup {
  label: string;
  translations: { en: string };
  items: (SidebarLink | SidebarGroup)[];
}

function labelOf(text: Localized): Pick<SidebarLink, 'label' | 'translations'> {
  // The default locale (vi) is the label; en goes in translations.
  return { label: text.vi, translations: { en: text.en } };
}

function toLink(lesson: Lesson): SidebarLink {
  return { slug: lesson.id, ...labelOf(lesson.shortTitle ?? lesson.title) };
}

function toGroup(text: Localized, items: SidebarGroup['items']): SidebarGroup {
  return { ...labelOf(text), items };
}

/**
 * Builds the Starlight sidebar: one group per part, only lessons that have a page.
 * The result is assignable to Starlight's `sidebar` option (type-checked in astro.config.ts).
 */
export function buildSidebar(
  parts: readonly Part[] = PARTS,
  lessons: readonly Lesson[] = LESSONS,
): SidebarGroup[] {
  const groups: SidebarGroup[] = [];

  for (const part of parts) {
    const partLessons = lessons.filter((lesson) => getPartIdOf(lesson.id) === part.id && hasPage(lesson));
    if (partLessons.length === 0) continue; // Starlight would render an empty group

    const items: SidebarGroup['items'] = part.sections
      ? part.sections
          .map((section) =>
            toGroup(
              section.title,
              partLessons.filter((lesson) => lesson.section === section.id).map(toLink),
            ),
          )
          .filter((group) => group.items.length > 0)
      : partLessons.map(toLink);

    groups.push(toGroup(part.title, items));
  }

  return groups;
}
