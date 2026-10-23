// Multiple-choice quiz, one answer per question (docs/architecture/components.md, sections 4.4, 4.9.3).
// Every string arrives through props, so the island renders the same at build time, in the browser and in tests.
import { useEffect, useId, useRef, useState } from 'react';
import { formatString } from '../../i18n/format';
import type { UiStrings } from '../../i18n/ui';

export interface RenderedQuizQuestion {
  questionHtml: string; // renderInlineMarkup output (trusted: build time, repo content)
  optionsHtml: string[];
  answer: number;
  explanationHtml: string;
  // inlineMarkupLabel output: plain text with TeX source, for the accessible names (section 4.4).
  questionLabel: string;
  optionLabels: string[];
}

export interface QuizIslandProps {
  questions: RenderedQuizQuestion[];
  strings: UiStrings<'quiz'>;
  /**
   * Language of the quiz text when it is not the page's (Starlight's fallback page: an en URL showing the vi
   * file). Set as `lang` on the question, the options and the explanation; the strings keep the page's.
   */
  contentLang?: string;
}

interface QuestionState {
  selected: number | null;
  checked: boolean;
  /** "Check" was pressed with nothing selected. */
  needsChoice: boolean;
}

const INITIAL: QuestionState = { selected: null, checked: false, needsChoice: false };

// A live region only speaks a change: "Check" pressed again with nothing selected empties the reminder
// and puts it back this much later, so it is read again.
export const REANNOUNCE_MS = 100;

type OptionState = 'correct' | 'wrong' | 'selected' | undefined;

function optionState(state: QuestionState, index: number, answer: number): OptionState {
  if (state.checked) {
    if (index === answer) return 'correct';
    return index === state.selected ? 'wrong' : undefined;
  }
  return index === state.selected ? 'selected' : undefined;
}

// dangerouslySetInnerHTML below only ever receives HTML made by renderInlineMarkup() in Quiz.astro,
// at build time, from quiz text in this repo (escaped, plus KaTeX and <code>). Never reader input.
const html = (markup: string) => ({ __html: markup });

export default function QuizIsland({ questions, strings, contentLang }: QuizIslandProps) {
  // Unique per island and stable between build and hydration (section 2.9). Only for id/name/for.
  const uid = useId();
  const [states, setStates] = useState<QuestionState[]>(() => questions.map(() => INITIAL));
  const firstOptions = useRef<(HTMLInputElement | null)[]>([]);
  // "Try again" re-enables the radios; focus moves to the first one once that has rendered.
  const pendingFocus = useRef<number | null>(null);
  const reannounce = useRef<number[]>([]);
  const list = useRef<HTMLDivElement>(null);

  // A radio that got focus before hydration (Tab into a quiz that just scrolled into view) keeps a stale radio
  // group in Chrome: the next Tab stops on the second radio first. Focusing it again once fixes that. Only when
  // focus is already on one of this quiz's radios; never takes focus from anywhere else.
  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLInputElement && active.type === 'radio' && list.current?.contains(active)) {
      active.blur();
      active.focus();
    }
  }, []);

  useEffect(() => {
    if (pendingFocus.current === null) return;
    firstOptions.current[pendingFocus.current]?.focus();
    pendingFocus.current = null;
  });

  useEffect(() => () => reannounce.current.forEach((timer) => window.clearTimeout(timer)), []);

  const update = (index: number, next: (state: QuestionState) => QuestionState) =>
    setStates((all) => all.map((state, i) => (i === index ? next(state) : state)));

  const select = (index: number, option: number) =>
    update(index, (state) => (state.checked ? state : { ...state, selected: option, needsChoice: false }));

  const askForChoice = (index: number) =>
    update(index, (state) => (state.selected === null && !state.checked ? { ...state, needsChoice: true } : state));

  const pressButton = (index: number) => {
    const current = states[index] ?? INITIAL;
    if (current.checked) {
      pendingFocus.current = index;
      update(index, () => INITIAL);
      return;
    }
    if (current.selected !== null) {
      update(index, (state) => ({ ...state, checked: true, needsChoice: false }));
      return;
    }
    window.clearTimeout(reannounce.current[index]);
    if (current.needsChoice) {
      update(index, (state) => ({ ...state, needsChoice: false }));
      reannounce.current[index] = window.setTimeout(() => askForChoice(index), REANNOUNCE_MS);
    } else {
      askForChoice(index);
    }
  };

  const total = questions.length;
  const allChecked = states.every((state) => state.checked);
  const correctCount = states.filter((state, i) => state.checked && state.selected === questions[i]?.answer).length;

  return (
    <div className="atlas-quiz-list" ref={list}>
      {questions.map((question, i) => {
        const state = states[i] ?? INITIAL;
        const name = `${uid}-q${i}`;
        const isCorrect = state.checked && state.selected === question.answer;
        const count = formatString(strings.question, { n: i + 1, total });
        return (
          // aria-label (count + question with TeX source): Chrome would leave a formula out of the legend's name.
          <fieldset
            className="atlas-quiz-question"
            key={i}
            data-checked={state.checked || undefined}
            aria-label={`${count} ${question.questionLabel}`}
          >
            <legend className="atlas-quiz-legend">
              <span className="atlas-quiz-count">{count}</span>{' '}
              <span
                className="atlas-quiz-prompt"
                lang={contentLang}
                dangerouslySetInnerHTML={html(question.questionHtml)}
              />
            </legend>

            <div className="atlas-quiz-options">
              {question.optionsHtml.map((optionHtml, j) => {
                const mark = optionState(state, j, question.answer);
                const markText =
                  mark === 'correct' ? strings.correctAnswer : mark === 'wrong' ? strings.yourAnswer : undefined;
                const label = question.optionLabels[j] ?? '';
                return (
                  <label className="atlas-quiz-option" key={j} htmlFor={`${name}-o${j}`} data-state={mark}>
                    <input
                      type="radio"
                      id={`${name}-o${j}`}
                      name={name}
                      // Same reason as the fieldset: the label's formula has no name in Chrome.
                      aria-label={markText ? `${label}, ${markText}` : label}
                      lang={contentLang}
                      checked={state.selected === j}
                      disabled={state.checked}
                      onChange={() => select(i, j)}
                      ref={
                        j === 0
                          ? (element) => {
                              firstOptions.current[i] = element;
                            }
                          : undefined
                      }
                    />
                    <span className="atlas-quiz-option-body">
                      <span
                        className="atlas-quiz-option-text"
                        lang={contentLang}
                        dangerouslySetInnerHTML={html(optionHtml)}
                      />
                      {markText && (
                        <span className="atlas-quiz-mark">
                          <span className={mark === 'correct' ? 'atlas-check' : 'atlas-cross'} aria-hidden="true" />
                          {markText}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="atlas-quiz-actions">
              <button
                type="button"
                className={state.checked ? 'atlas-quiz-button' : 'atlas-quiz-button atlas-quiz-button-primary'}
                onClick={() => pressButton(i)}
              >
                {state.checked ? strings.retry : strings.check}
              </button>
            </div>

            {/* The live region always exists; only its content changes, so screen readers announce it. */}
            <div className="atlas-quiz-feedback" aria-live="polite">
              {state.needsChoice && <p className="atlas-quiz-choose">{strings.chooseOne}</p>}
              {state.checked && (
                <>
                  <p className="atlas-quiz-verdict" data-correct={isCorrect}>
                    <span className={isCorrect ? 'atlas-check' : 'atlas-cross'} aria-hidden="true" />
                    <strong>{isCorrect ? strings.correct : strings.incorrect}</strong>
                  </p>
                  <p className="atlas-quiz-explanation">
                    <strong>{strings.explanation}:</strong>{' '}
                    <span lang={contentLang} dangerouslySetInnerHTML={html(question.explanationHtml)} />
                  </p>
                </>
              )}
            </div>
          </fieldset>
        );
      })}

      <div className="atlas-quiz-total" aria-live="polite">
        {allChecked && (
          <p className="atlas-quiz-score">{formatString(strings.score, { correct: correctCount, total })}</p>
        )}
      </div>
    </div>
  );
}
