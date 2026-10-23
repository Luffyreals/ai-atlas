// Ticks and "Learned x/y" lines over server-rendered HTML. Used by the <script> of
// Prerequisites and RoadmapMap, so plain modules only, no React.
import { formatString } from '../i18n/format';
import { countDone, getProgressStore, type ProgressData, type ProgressStore } from './progress';

function lessonIdsIn(scope: ParentNode): string[] {
  const ids = [...scope.querySelectorAll<HTMLElement>('[data-lesson-id]')].map((el) => el.dataset.lessonId ?? '');
  return [...new Set(ids.filter(Boolean))];
}

/**
 * Sets data-done="true|false" on every [data-lesson-id] inside root.
 * Fills every [data-progress-summary] (template in data-template, {{done}} and {{total}}):
 * ids are the [data-lesson-id] inside its closest [data-progress-scope]; hidden while done === 0.
 * A summary without data-template keeps its own content and is only shown or hidden.
 * Re-applies on store changes. Returns an unsubscribe function.
 */
export function applyProgressMarks(root: ParentNode = document, store: ProgressStore = getProgressStore()): () => void {
  const apply = (data: ProgressData) => {
    const isDone = (id: string) => Object.hasOwn(data.lessons, id);

    for (const item of root.querySelectorAll<HTMLElement>('[data-lesson-id]')) {
      item.dataset.done = String(isDone(item.dataset.lessonId ?? ''));
    }

    for (const summary of root.querySelectorAll<HTMLElement>('[data-progress-summary]')) {
      const ids = lessonIdsIn(summary.closest('[data-progress-scope]') ?? root);
      const done = countDone(ids, isDone);
      summary.hidden = done === 0;
      const template = summary.dataset.template;
      if (template !== undefined && done > 0) {
        summary.textContent = formatString(template, { done, total: ids.length });
      }
    }
  };

  apply(store.get());
  return store.subscribe(apply);
}
