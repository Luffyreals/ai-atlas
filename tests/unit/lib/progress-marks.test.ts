// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyProgressMarks as applyMarks } from '../../../src/lib/progress-marks';
import { createProgressStore, PROGRESS_STORAGE_KEY, type ProgressStore } from '../../../src/lib/progress';

// Two parts, each a scope with its own summary, inside a map-wide scope with a total and a legend line.
const MAP_HTML = `
  <div data-roadmap data-progress-scope>
    <section data-progress-scope id="ml">
      <p data-progress-summary data-template="Learned {{done}}/{{total}}" hidden></p>
      <ol>
        <li data-lesson-id="ml/linear-regression">Linear regression</li>
        <li data-lesson-id="ml/logistic-regression">Logistic regression</li>
        <li data-lesson-id="ml/pca">PCA</li>
      </ol>
    </section>
    <section data-progress-scope id="dl">
      <p data-progress-summary data-template="Learned {{done}}/{{total}}" hidden></p>
      <ol><li data-lesson-id="dl/cnn">CNN</li></ol>
    </section>
    <p id="total" data-progress-summary data-template="You have learned {{done}} of {{total}} lessons." hidden></p>
    <p id="legend" data-progress-summary hidden><span class="atlas-check"></span>Tick: lessons you have learned</p>
  </div>
`;

const byId = (id: string) => document.getElementById(id) as HTMLElement;
const summaryOf = (scopeId: string) => byId(scopeId).querySelector<HTMLElement>('[data-progress-summary]')!;
const item = (id: string) => document.querySelector<HTMLElement>(`[data-lesson-id="${id}"]`)!;

let store: ProgressStore;
let cleanups: (() => void)[] = [];

/** Every subscription listens on window, so each test removes its own. */
function applyProgressMarks(...args: Parameters<typeof applyMarks>): () => void {
  const unsubscribe = applyMarks(...args);
  cleanups.push(unsubscribe);
  return unsubscribe;
}

beforeEach(() => {
  document.body.innerHTML = MAP_HTML;
  window.localStorage.clear();
  store = createProgressStore(window.localStorage, window);
});

afterEach(() => {
  for (const cleanup of cleanups) cleanup();
  cleanups = [];
});

describe('applyProgressMarks', () => {
  it('marks nothing done and keeps every summary hidden on a first visit', () => {
    applyProgressMarks(document, store);
    for (const li of document.querySelectorAll<HTMLElement>('[data-lesson-id]')) {
      expect(li.dataset.done).toBe('false');
    }
    for (const summary of document.querySelectorAll<HTMLElement>('[data-progress-summary]')) {
      expect(summary.hidden).toBe(true);
    }
  });

  it('sets data-done and fills the summaries of the scopes that have done lessons', () => {
    store.setDone('ml/linear-regression', true);
    store.setDone('ml/pca', true);
    applyProgressMarks(document, store);

    expect(item('ml/linear-regression').dataset.done).toBe('true');
    expect(item('ml/logistic-regression').dataset.done).toBe('false');
    expect(item('ml/pca').dataset.done).toBe('true');

    expect(summaryOf('ml').hidden).toBe(false);
    expect(summaryOf('ml').textContent).toBe('Learned 2/3');
    expect(summaryOf('dl').hidden).toBe(true);
    expect(byId('total').hidden).toBe(false);
    expect(byId('total').textContent).toBe('You have learned 2 of 4 lessons.');
  });

  it('only shows a summary without data-template, keeping its content', () => {
    store.setDone('dl/cnn', true);
    applyProgressMarks(document, store);
    expect(byId('legend').hidden).toBe(false);
    expect(byId('legend').querySelector('.atlas-check')).not.toBeNull();
    expect(byId('legend').textContent).toBe('Tick: lessons you have learned');
  });

  it('re-applies on store changes until unsubscribed', () => {
    const unsubscribe = applyProgressMarks(document, store);
    store.setDone('dl/cnn', true);
    expect(item('dl/cnn').dataset.done).toBe('true');
    expect(summaryOf('dl').textContent).toBe('Learned 1/1');

    store.setDone('dl/cnn', false);
    expect(item('dl/cnn').dataset.done).toBe('false');
    expect(summaryOf('dl').hidden).toBe(true);

    unsubscribe();
    store.setDone('dl/cnn', true);
    expect(item('dl/cnn').dataset.done).toBe('false');
  });

  it('follows writes from another tab (storage event)', () => {
    applyProgressMarks(document, store);
    const data = { version: 1, lessons: { 'ml/pca': { doneAt: '2026-10-01T00:00:00.000Z' } } };
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new StorageEvent('storage', { key: PROGRESS_STORAGE_KEY }));
    expect(item('ml/pca').dataset.done).toBe('true');
    expect(summaryOf('ml').textContent).toBe('Learned 1/3');
  });

  it('limits itself to root, and counts against root when a summary has no scope', () => {
    document.body.innerHTML = `
      <div id="a">
        <ul><li data-lesson-id="ml/pca"></li><li data-lesson-id="ml/svm"></li></ul>
        <p data-progress-summary data-template="{{done}}/{{total}}" hidden></p>
      </div>
      <ul id="b"><li data-lesson-id="ml/pca"></li></ul>
    `;
    store.setDone('ml/pca', true);
    applyProgressMarks(byId('a'), store);
    expect(byId('a').querySelector<HTMLElement>('[data-lesson-id]')!.dataset.done).toBe('true');
    expect(byId('b').querySelector<HTMLElement>('[data-lesson-id]')!.dataset.done).toBeUndefined();
    expect(byId('a').querySelector('[data-progress-summary]')!.textContent).toBe('1/2');
  });

  it('works with blocked storage', () => {
    const blocked = createProgressStore(null, window);
    expect(() => applyProgressMarks(document, blocked)).not.toThrow();
    blocked.setDone('ml/pca', true);
    expect(item('ml/pca').dataset.done).toBe('true');
  });
});
