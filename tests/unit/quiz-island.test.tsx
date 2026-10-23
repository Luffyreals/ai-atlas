// @vitest-environment jsdom
// QuizIsland behaviour (docs/architecture/components.md, sections 4.4 and 2.9; plan row M1-6).
// Elements are found by role and accessible name only; useId strings are never used as selectors.
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import QuizIsland, { REANNOUNCE_MS, type RenderedQuizQuestion } from '../../src/components/quiz/QuizIsland';
import { formatString } from '../../src/i18n/format';
import { UI_KEYS, type UiStrings } from '../../src/i18n/ui';
import { inlineMarkupLabel, renderInlineMarkup } from '../../src/lib/inline-markup';
// Imported rather than read from disk: under jsdom, import.meta.url is not a file: URL.
import enJson from '../../src/content/i18n/en.json';
import viJson from '../../src/content/i18n/vi.json';

/** The real quiz strings of one locale, as getStrings(t, 'quiz') would pass them. */
function quizStrings(locale: 'vi' | 'en'): UiStrings<'quiz'> {
  const all: Record<string, string> = locale === 'vi' ? viJson : enJson;
  const entries = UI_KEYS.quiz.map((key) => {
    const value = all[`atlas.quiz.${key}`];
    if (!value) throw new Error(`missing atlas.quiz.${key} in ${locale}.json`);
    return [key, value] as const;
  });
  return Object.fromEntries(entries) as UiStrings<'quiz'>;
}

const VI = quizStrings('vi');
const EN = quizStrings('en');

// Three questions; correct answers are B, Y and N. Inline HTML stands in for renderInlineMarkup output.
const QUESTIONS: RenderedQuizQuestion[] = [
  {
    questionHtml: 'First prompt about <code>np.mean</code>',
    optionsHtml: ['Alpha', 'Bravo', 'Charlie'],
    answer: 1,
    explanationHtml: 'Bravo is right because <code>np.mean</code> averages.',
    questionLabel: 'First prompt about np.mean',
    optionLabels: ['Alpha', 'Bravo', 'Charlie'],
  },
  {
    questionHtml: 'Second prompt',
    optionsHtml: ['Xray', 'Yankee'],
    answer: 1,
    explanationHtml: 'Yankee explanation.',
    questionLabel: 'Second prompt',
    optionLabels: ['Xray', 'Yankee'],
  },
  {
    questionHtml: 'Third prompt',
    optionsHtml: ['Mike', 'November', 'Oscar', 'Papa'],
    answer: 1,
    explanationHtml: 'November explanation.',
    questionLabel: 'Third prompt',
    optionLabels: ['Mike', 'November', 'Oscar', 'Papa'],
  },
];

const OTHER_QUESTIONS: RenderedQuizQuestion[] = [
  {
    questionHtml: 'Other prompt',
    optionsHtml: ['Red', 'Green'],
    answer: 0,
    explanationHtml: 'Red explanation.',
    questionLabel: 'Other prompt',
    optionLabels: ['Red', 'Green'],
  },
];

/** A question rendered the way Quiz.astro does it, from frontmatter-style source strings. */
function rendered(question: string, options: string[], answer: number, explanation: string): RenderedQuizQuestion {
  return {
    questionHtml: renderInlineMarkup(question),
    optionsHtml: options.map((option) => renderInlineMarkup(option)),
    answer,
    explanationHtml: renderInlineMarkup(explanation),
    questionLabel: inlineMarkupLabel(question),
    optionLabels: options.map((option) => inlineMarkupLabel(option)),
  };
}

// Like the first question of the demo page: answers that are a formula and nothing else.
const FORMULA_QUESTIONS: RenderedQuizQuestion[] = [
  rendered(String.raw`Sai số $\frac{1}{2}(\hat{y} - y)^2$ bằng bao nhiêu?`, ['$2$', String.raw`$\frac{1}{2}$`, '`0.25`'], 1, 'Vì $1^2 = 1$.'),
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Question n (1-based) of the quiz, found through its legend "Câu n/total". */
function question(n: number, total: number, strings = VI, root: HTMLElement = document.body): HTMLElement {
  const count = formatString(strings.question, { n, total });
  return within(root).getByRole('group', { name: new RegExp(`^${escapeRegExp(count)}`) });
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
}

/** A radio by the start of its label: after checking, the label also holds the "correct answer" mark. */
function option(group: HTMLElement, text: string): HTMLInputElement {
  return within(group).getByRole('radio', { name: new RegExp(`^${escapeRegExp(text)}`) }) as HTMLInputElement;
}

function radios(group: HTMLElement): HTMLInputElement[] {
  return within(group).getAllByRole('radio') as HTMLInputElement[];
}

/** The per-question live region that holds "choose one", the verdict and the explanation. */
function feedback(group: HTMLElement): HTMLElement {
  const regions = group.querySelectorAll<HTMLElement>('[aria-live="polite"]');
  expect(regions.length).toBe(1);
  return regions[0] as HTMLElement;
}

function scoreText(container: HTMLElement): string | null {
  return container.querySelector('.atlas-quiz-score')?.textContent ?? null;
}

function labelOf(input: HTMLInputElement): HTMLLabelElement {
  const label = input.closest('label');
  expect(label).not.toBeNull();
  return label as HTMLLabelElement;
}

describe('QuizIsland: grading one question', () => {
  it('renders one fieldset per question with a "Câu n/total" legend and real radios', () => {
    render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    expect(screen.getAllByRole('group')).toHaveLength(3);
    const q1 = question(1, 3);
    expect(q1.tagName).toBe('FIELDSET');
    expect(q1.querySelector('legend')?.textContent).toContain('Câu 1/3');
    expect(q1.querySelector('legend code')?.textContent).toBe('np.mean');
    expect(radios(q1).map((radio) => labelOf(radio).textContent)).toEqual(['Alpha', 'Bravo', 'Charlie']);
    for (const radio of radios(q1)) {
      expect(radio.checked).toBe(false);
      expect(radio.disabled).toBe(false);
    }
    const button = within(q1).getByRole('button', { name: VI.check });
    expect(button.getAttribute('type')).toBe('button');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(feedback(q1).textContent).toBe('');
  });

  it('shows "correct" and the explanation for the right answer', async () => {
    const user = userEvent.setup();
    render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    const q1 = question(1, 3);
    await user.click(option(q1, 'Bravo'));
    await user.click(within(q1).getByRole('button', { name: VI.check }));

    const region = feedback(q1);
    expect(within(region).getByText(VI.correct)).toBeTruthy();
    expect(region.textContent).not.toContain(VI.incorrect);
    expect(region.textContent).toContain(`${VI.explanation}:`);
    expect(region.textContent).toContain('Bravo is right because np.mean averages.');
    expect(region.querySelector('code')?.textContent).toBe('np.mean');

    // Locked, marked and the button became "retry".
    expect(q1.hasAttribute('data-checked')).toBe(true);
    for (const radio of radios(q1)) expect(radio.disabled).toBe(true);
    expect(option(q1, 'Bravo').checked).toBe(true);
    expect(labelOf(option(q1, 'Bravo')).getAttribute('data-state')).toBe('correct');
    expect(labelOf(option(q1, 'Bravo')).textContent).toContain(VI.correctAnswer);
    expect(labelOf(option(q1, 'Alpha')).hasAttribute('data-state')).toBe(false);
    expect(q1.textContent).not.toContain(VI.yourAnswer);
    expect(within(q1).getByRole('button', { name: VI.retry })).toBeTruthy();
  });

  it('shows "incorrect" and marks both the chosen and the right answer', async () => {
    const user = userEvent.setup();
    render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    const q1 = question(1, 3);
    await user.click(option(q1, 'Charlie'));
    await user.click(within(q1).getByRole('button', { name: VI.check }));

    const region = feedback(q1);
    expect(within(region).getByText(VI.incorrect)).toBeTruthy();
    expect(region.textContent).not.toContain(VI.correct);
    expect(region.textContent).toContain('Bravo is right because np.mean averages.');

    const chosen = labelOf(option(q1, 'Charlie'));
    const right = labelOf(option(q1, 'Bravo'));
    expect(chosen.getAttribute('data-state')).toBe('wrong');
    expect(chosen.textContent).toContain(VI.yourAnswer);
    expect(chosen.textContent).not.toContain(VI.correctAnswer);
    expect(right.getAttribute('data-state')).toBe('correct');
    expect(right.textContent).toContain(VI.correctAnswer);
    expect(right.textContent).not.toContain(VI.yourAnswer);
    expect(labelOf(option(q1, 'Alpha')).hasAttribute('data-state')).toBe(false);
    expect(option(q1, 'Charlie').checked).toBe(true);
  });

  it('asks for a choice instead of grading when nothing is selected', async () => {
    const user = userEvent.setup();
    const { container } = render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    const q1 = question(1, 3);
    const button = within(q1).getByRole('button', { name: VI.check });
    await user.click(button);

    expect(feedback(q1).textContent).toBe(VI.chooseOne);
    expect(q1.hasAttribute('data-checked')).toBe(false);
    expect(q1.textContent).not.toContain(VI.correct);
    expect(q1.textContent).not.toContain(VI.incorrect);
    expect(q1.textContent).not.toContain(VI.explanation);
    for (const radio of radios(q1)) expect(radio.disabled).toBe(false);
    expect(button.textContent).toBe(VI.check);
    expect(scoreText(container)).toBeNull();

    // Pressing again keeps asking (emptied, then filled again so it is read again); picking an answer
    // clears the reminder.
    await user.click(button);
    await waitFor(() => expect(feedback(q1).textContent).toBe(VI.chooseOne));
    await user.click(option(q1, 'Alpha'));
    expect(feedback(q1).textContent).toBe('');
    expect(labelOf(option(q1, 'Alpha')).getAttribute('data-state')).toBe('selected');
  });

  it('keeps the same button element when it switches between check and retry', async () => {
    const user = userEvent.setup();
    render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    const q1 = question(1, 3);
    const button = within(q1).getByRole('button', { name: VI.check });
    await user.click(option(q1, 'Alpha'));
    await user.click(button);
    expect(within(q1).getByRole('button', { name: VI.retry })).toBe(button);
    await user.click(button);
    expect(within(q1).getByRole('button', { name: VI.check })).toBe(button);
  });

  it('ignores clicks on the locked radios after grading', async () => {
    const user = userEvent.setup();
    render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    const q1 = question(1, 3);
    await user.click(option(q1, 'Charlie'));
    await user.click(within(q1).getByRole('button', { name: VI.check }));
    await user.click(option(q1, 'Bravo'));
    expect(option(q1, 'Charlie').checked).toBe(true);
    expect(option(q1, 'Bravo').checked).toBe(false);
    expect(within(feedback(q1)).getByText(VI.incorrect)).toBeTruthy();
  });
});

describe('QuizIsland: "check" pressed again with nothing selected', () => {
  it('empties the live region, then puts the reminder back, so a screen reader reads it again', () => {
    vi.useFakeTimers();
    try {
      render(<QuizIsland questions={QUESTIONS} strings={VI} />);
      const q1 = question(1, 3);
      const button = within(q1).getByRole('button', { name: VI.check });
      act(() => button.click());
      expect(feedback(q1).textContent).toBe(VI.chooseOne);
      const first = feedback(q1).querySelector('p');

      act(() => button.click());
      expect(feedback(q1).textContent).toBe('');
      act(() => vi.advanceTimersByTime(REANNOUNCE_MS));
      expect(feedback(q1).textContent).toBe(VI.chooseOne);
      // A new node, not the old one left in place.
      expect(feedback(q1).querySelector('p')).not.toBe(first);

      // A third press does the same.
      act(() => button.click());
      expect(feedback(q1).textContent).toBe('');
      act(() => vi.advanceTimersByTime(REANNOUNCE_MS));
      expect(feedback(q1).textContent).toBe(VI.chooseOne);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not bring the reminder back once an answer was picked in the meantime', () => {
    vi.useFakeTimers();
    try {
      render(<QuizIsland questions={QUESTIONS} strings={VI} />);
      const q1 = question(1, 3);
      const button = within(q1).getByRole('button', { name: VI.check });
      act(() => button.click());
      act(() => button.click());
      act(() => option(q1, 'Alpha').click());
      act(() => vi.advanceTimersByTime(REANNOUNCE_MS * 2));
      expect(feedback(q1).textContent).toBe('');
      expect(option(q1, 'Alpha').checked).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('leaves no timer running after unmount', () => {
    vi.useFakeTimers();
    try {
      const view = render(<QuizIsland questions={QUESTIONS} strings={VI} />);
      const button = within(question(1, 3)).getByRole('button', { name: VI.check });
      act(() => button.click());
      act(() => button.click());
      expect(vi.getTimerCount()).toBe(1);
      view.unmount();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('QuizIsland: accessible names with formulas (decision 12)', () => {
  it('names every radio from its text with the TeX source, never an empty name', () => {
    render(<QuizIsland questions={FORMULA_QUESTIONS} strings={VI} />);
    const group = question(1, 1);
    expect(radios(group).map((radio) => radio.getAttribute('aria-label'))).toEqual(['2', String.raw`\frac{1}{2}`, '0.25']);
    for (const radio of radios(group)) {
      expect(within(group).getByRole('radio', { name: radio.getAttribute('aria-label')! })).toBe(radio);
    }
    // The radios of the other fixtures have a name too.
    cleanup();
    render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    for (const radio of screen.getAllByRole('radio')) expect(radio.getAttribute('aria-label')?.trim()).toBeTruthy();
  });

  it('names the group "Câu n/total" plus the question with its TeX source', () => {
    render(<QuizIsland questions={FORMULA_QUESTIONS} strings={VI} />);
    const group = screen.getByRole('group');
    expect(group.getAttribute('aria-label')).toBe(String.raw`Câu 1/1 Sai số \frac{1}{2}(\hat{y} - y)^2 bằng bao nhiêu?`);
    expect(screen.getByRole('group', { name: group.getAttribute('aria-label')! })).toBe(group);
    // The visible legend still holds the KaTeX output.
    expect(group.querySelector('legend .katex')).not.toBeNull();
  });

  it('adds "Đáp án đúng" and "Bạn chọn" to the names once graded, and drops them on retry', async () => {
    const user = userEvent.setup();
    render(<QuizIsland questions={FORMULA_QUESTIONS} strings={VI} />);
    const group = question(1, 1);
    await user.click(within(group).getByRole('radio', { name: '2' }));
    await user.click(within(group).getByRole('button', { name: VI.check }));
    expect(radios(group).map((radio) => radio.getAttribute('aria-label'))).toEqual([
      `2, ${VI.yourAnswer}`,
      String.raw`\frac{1}{2}, ` + VI.correctAnswer,
      '0.25',
    ]);
    await user.click(within(group).getByRole('button', { name: VI.retry }));
    expect(radios(group).map((radio) => radio.getAttribute('aria-label'))).toEqual(['2', String.raw`\frac{1}{2}`, '0.25']);
  });

  it('keeps a space between the count and the question in the legend text', () => {
    render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    expect(question(1, 3).querySelector('legend')?.textContent).toBe('Câu 1/3 First prompt about np.mean');
  });
});

describe('QuizIsland: try again', () => {
  it('clears the choice, unlocks the radios, hides the score and focuses the first option', async () => {
    const user = userEvent.setup();
    const { container } = render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    for (const [n, text] of [[1, 'Bravo'], [2, 'Xray'], [3, 'November']] as const) {
      const group = question(n, 3);
      await user.click(option(group, text));
      await user.click(within(group).getByRole('button', { name: VI.check }));
    }
    expect(scoreText(container)).toBe(formatString(VI.score, { correct: 2, total: 3 }));

    const q2 = question(2, 3);
    await user.click(within(q2).getByRole('button', { name: VI.retry }));

    for (const radio of radios(q2)) {
      expect(radio.checked).toBe(false);
      expect(radio.disabled).toBe(false);
      expect(labelOf(radio).hasAttribute('data-state')).toBe(false);
    }
    expect(q2.hasAttribute('data-checked')).toBe(false);
    expect(feedback(q2).textContent).toBe('');
    expect(q2.textContent).not.toContain(VI.yourAnswer);
    expect(q2.textContent).not.toContain(VI.correctAnswer);
    expect(within(q2).getByRole('button', { name: VI.check })).toBeTruthy();
    expect(document.activeElement).toBe(option(q2, 'Xray'));
    expect(scoreText(container)).toBeNull();

    // The other questions keep their result.
    expect(question(1, 3).hasAttribute('data-checked')).toBe(true);
    expect(option(question(1, 3), 'Bravo').checked).toBe(true);

    // Answering again brings the score back, now 3/3.
    await user.click(option(q2, 'Yankee'));
    await user.click(within(q2).getByRole('button', { name: VI.check }));
    expect(scoreText(container)).toBe(formatString(VI.score, { correct: 3, total: 3 }));
  });

  it('also focuses the first option when "try again" is used in StrictMode', async () => {
    const user = userEvent.setup();
    render(<QuizIsland questions={QUESTIONS} strings={VI} />, { reactStrictMode: true });
    const q3 = question(3, 3);
    await user.click(option(q3, 'Papa'));
    await user.click(within(q3).getByRole('button', { name: VI.check }));
    await user.click(within(q3).getByRole('button', { name: VI.retry }));
    expect(document.activeElement).toBe(option(q3, 'Mike'));
    expect(option(q3, 'Papa').checked).toBe(false);
  });
});

describe('QuizIsland: score', () => {
  it('shows "2/3" only once every question is graded', async () => {
    const user = userEvent.setup();
    const { container } = render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    const total = container.querySelectorAll('.atlas-quiz-total[aria-live="polite"]');
    expect(total).toHaveLength(1);
    expect(scoreText(container)).toBeNull();

    const q1 = question(1, 3);
    await user.click(option(q1, 'Bravo'));
    await user.click(within(q1).getByRole('button', { name: VI.check }));
    expect(scoreText(container)).toBeNull();

    const q2 = question(2, 3);
    await user.click(option(q2, 'Yankee'));
    await user.click(within(q2).getByRole('button', { name: VI.check }));
    expect(scoreText(container)).toBeNull();

    // Selected but not checked yet: still no score.
    const q3 = question(3, 3);
    await user.click(option(q3, 'Oscar'));
    expect(scoreText(container)).toBeNull();
    await user.click(within(q3).getByRole('button', { name: VI.check }));

    expect(scoreText(container)).toBe('Bạn đúng 2/3 câu.');
    expect((total[0] as HTMLElement).textContent).toBe('Bạn đúng 2/3 câu.');
  });

  it('scores 0 when every answer is wrong', async () => {
    const user = userEvent.setup();
    const { container } = render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    for (const [n, text] of [[1, 'Alpha'], [2, 'Xray'], [3, 'Papa']] as const) {
      const group = question(n, 3);
      await user.click(option(group, text));
      await user.click(within(group).getByRole('button', { name: VI.check }));
    }
    expect(scoreText(container)).toBe('Bạn đúng 0/3 câu.');
  });
});

describe('QuizIsland: keyboard only', () => {
  it('can be completed with Tab, arrow keys, Space and Enter', async () => {
    const user = userEvent.setup();
    const { container } = render(<QuizIsland questions={QUESTIONS} strings={VI} />);
    const [q1, q2, q3] = [question(1, 3), question(2, 3), question(3, 3)] as const;

    // Question 1: Tab into the group, ArrowDown picks the next option, Tab to the button, Enter checks.
    await user.tab();
    expect(document.activeElement).toBe(option(q1, 'Alpha'));
    await user.keyboard('{ArrowDown}');
    expect(option(q1, 'Bravo').checked).toBe(true);
    expect(document.activeElement).toBe(option(q1, 'Bravo'));
    await user.tab();
    expect(document.activeElement).toBe(within(q1).getByRole('button', { name: VI.check }));
    await user.keyboard('{Enter}');
    expect(within(feedback(q1)).getByText(VI.correct)).toBeTruthy();
    // Focus stays on the button, which now says "try again".
    expect(document.activeElement).toBe(within(q1).getByRole('button', { name: VI.retry }));

    // Question 2: Space selects the focused option, Space on the button checks.
    await user.tab();
    expect(document.activeElement).toBe(option(q2, 'Xray'));
    await user.keyboard(' ');
    expect(option(q2, 'Xray').checked).toBe(true);
    await user.tab();
    await user.keyboard(' ');
    expect(within(feedback(q2)).getByText(VI.incorrect)).toBeTruthy();

    // Retry question 2 from the keyboard: focus returns to its first option.
    await user.keyboard('{Enter}');
    expect(document.activeElement).toBe(option(q2, 'Xray'));
    expect(option(q2, 'Xray').checked).toBe(false);
    await user.keyboard('{ArrowDown}');
    expect(option(q2, 'Yankee').checked).toBe(true);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(within(feedback(q2)).getByText(VI.correct)).toBeTruthy();

    // Question 3: "check" with nothing chosen first, then back to the options with Shift+Tab.
    await user.tab();
    expect(document.activeElement).toBe(option(q3, 'Mike'));
    await user.tab();
    await user.keyboard('{Enter}');
    expect(feedback(q3).textContent).toBe(VI.chooseOne);
    // Shift+Tab into a group with nothing checked lands on its last radio, as in browsers.
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(option(q3, 'Papa'));
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}{ArrowDown}');
    expect(option(q3, 'November').checked).toBe(true);
    expect(feedback(q3).textContent).toBe('');
    await user.tab();
    await user.keyboard('{Enter}');

    expect(scoreText(container)).toBe('Bạn đúng 3/3 câu.');
  });
});

describe('QuizIsland: several islands on one page', () => {
  it('keeps two quizzes independent, with distinct radio names and no duplicate ids', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <section aria-label="quiz one">
          <QuizIsland questions={QUESTIONS} strings={VI} />
        </section>
        <section aria-label="quiz two">
          <QuizIsland questions={OTHER_QUESTIONS} strings={VI} />
        </section>
      </>,
    );
    const one = screen.getByRole('region', { name: 'quiz one' });
    const two = screen.getByRole('region', { name: 'quiz two' });

    const ids = [...container.querySelectorAll('[id]')].map((element) => element.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);

    // One radio group name per question, unique across both islands; every label points at its radio.
    const groups = [...container.querySelectorAll('fieldset')];
    const names = groups.map((group) => {
      const groupNames = new Set(radios(group as HTMLElement).map((radio) => radio.name));
      expect(groupNames.size).toBe(1);
      return [...groupNames][0];
    });
    expect(names).toHaveLength(4);
    expect(new Set(names).size).toBe(4);
    for (const radio of container.querySelectorAll<HTMLInputElement>('input[type="radio"]')) {
      expect(radio.name).not.toBe('');
      expect(labelOf(radio).htmlFor).toBe(radio.id);
    }

    // Answering in quiz two leaves quiz one untouched, and vice versa.
    const other = question(1, 1, VI, two);
    await user.click(option(other, 'Red'));
    await user.click(within(other).getByRole('button', { name: VI.check }));
    expect(scoreText(two)).toBe('Bạn đúng 1/1 câu.');
    expect(scoreText(one)).toBeNull();
    const first = question(1, 3, VI, one);
    for (const radio of radios(first)) {
      expect(radio.checked).toBe(false);
      expect(radio.disabled).toBe(false);
    }
    await user.click(option(first, 'Alpha'));
    expect(option(other, 'Red').checked).toBe(true);
    expect(option(first, 'Alpha').checked).toBe(true);
  });

  it('gets distinct ids from two separate roots too', () => {
    const a = render(<QuizIsland questions={OTHER_QUESTIONS} strings={VI} />);
    const b = render(<QuizIsland questions={OTHER_QUESTIONS} strings={EN} />);
    const idsA = [...a.container.querySelectorAll('[id]')].map((element) => element.id);
    const idsB = [...b.container.querySelectorAll('[id]')].map((element) => element.id);
    expect(idsA.filter((id) => idsB.includes(id))).toEqual([]);
  });
});

describe('QuizIsland: English strings', () => {
  it('grades, marks and scores with the en strings', async () => {
    const user = userEvent.setup();
    const { container } = render(<QuizIsland questions={QUESTIONS} strings={EN} />);
    const q1 = question(1, 3, EN);
    expect(q1.querySelector('legend')?.textContent).toContain('Question 1 of 3');

    await user.click(within(q1).getByRole('button', { name: 'Check' }));
    expect(feedback(q1).textContent).toBe('Pick an answer first.');

    await user.click(option(q1, 'Alpha'));
    await user.click(within(q1).getByRole('button', { name: 'Check' }));
    expect(within(feedback(q1)).getByText('Not quite.')).toBeTruthy();
    expect(feedback(q1).textContent).toContain('Explanation:');
    expect(labelOf(option(q1, 'Alpha')).textContent).toContain('Your answer');
    expect(labelOf(option(q1, 'Bravo')).textContent).toContain('Correct answer');
    expect(within(q1).getByRole('button', { name: 'Try again' })).toBeTruthy();
    // No Vietnamese leaks into the English island.
    expect(container.textContent).not.toMatch(/Câu|Kiểm tra|Bạn chọn|Đáp án đúng|Giải thích/);

    for (const [n, text] of [[2, 'Yankee'], [3, 'November']] as const) {
      const group = question(n, 3, EN);
      await user.click(option(group, text));
      await user.click(within(group).getByRole('button', { name: 'Check' }));
    }
    expect(within(feedback(question(2, 3, EN))).getByText('Correct.')).toBeTruthy();
    expect(scoreText(container)).toBe('You got 2 of 3 right.');
  });
});

describe('QuizIsland: server render and hydration', () => {
  it('hydrates the build-time HTML without mismatch and then works', async () => {
    // @astrojs/react passes the same identifierPrefix to renderToString and hydrateRoot (section 2.9).
    const element = <QuizIsland questions={QUESTIONS} strings={VI} />;
    const markup = renderToString(element, { identifierPrefix: 'r0' });
    // Questions and options are readable before hydration.
    expect(markup).toContain('Câu 1/3');
    expect(markup).toContain('<code>np.mean</code>');
    expect(markup).toContain('Charlie');
    expect(markup).not.toContain('atlas-quiz-score');

    const host = document.createElement('div');
    host.innerHTML = markup;
    document.body.append(host);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverable: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(host, element, {
        identifierPrefix: 'r0',
        onRecoverableError: (error) => recoverable.push(error),
      });
    });
    try {
      expect(recoverable).toEqual([]);
      expect(errors).not.toHaveBeenCalled();

      const user = userEvent.setup();
      const q1 = question(1, 3, VI, host);
      await user.click(option(q1, 'Bravo'));
      await user.click(within(q1).getByRole('button', { name: VI.check }));
      expect(within(feedback(q1)).getByText(VI.correct)).toBeTruthy();
    } finally {
      act(() => root?.unmount());
      host.remove();
    }
  });

  /** Server markup in the page, `before` runs on it, then it hydrates. Returns the host and a cleanup. */
  async function hydrateAfter(before: (host: HTMLElement) => void) {
    const element = <QuizIsland questions={QUESTIONS} strings={VI} />;
    const host = document.createElement('div');
    host.innerHTML = renderToString(element, { identifierPrefix: 'r1' });
    const outside = document.createElement('button');
    outside.textContent = 'outside';
    document.body.append(outside, host);
    before(host);
    const blur = vi.spyOn(HTMLElement.prototype, 'blur');
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    // A second call in one test gets the same spies back: count from here.
    blur.mockClear();
    focus.mockClear();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(host, element, { identifierPrefix: 'r1' });
    });
    const cleanupAll = () => {
      act(() => root?.unmount());
      host.remove();
      outside.remove();
    };
    return { host, outside, blur, focus, cleanup: cleanupAll };
  }

  it('focuses again, once, a radio of this quiz that had focus before hydration (Chrome Tab stop)', async () => {
    const view = await hydrateAfter((host) => host.querySelector<HTMLInputElement>('input[type="radio"]')!.focus());
    try {
      const first = view.host.querySelector<HTMLInputElement>('input[type="radio"]')!;
      expect(view.blur.mock.contexts).toEqual([first]);
      expect(view.focus.mock.contexts).toEqual([first]);
      expect(document.activeElement).toBe(first);
    } finally {
      view.cleanup();
    }
  });

  it('leaves focus alone when it is outside the quiz, or on its button', async () => {
    // hydrateAfter() appends the "outside" button right before the quiz.
    const elsewhere = await hydrateAfter((host) => (host.previousElementSibling as HTMLElement).focus());
    try {
      expect(elsewhere.blur).not.toHaveBeenCalled();
      expect(elsewhere.focus).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(elsewhere.outside);
    } finally {
      elsewhere.cleanup();
    }
    const onButton = await hydrateAfter((host) => host.querySelector('button')!.focus());
    try {
      expect(onButton.blur).not.toHaveBeenCalled();
      expect(onButton.focus).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(onButton.host.querySelector('button'));
    } finally {
      onButton.cleanup();
    }
  });
});
