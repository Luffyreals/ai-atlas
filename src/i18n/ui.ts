// Single source of truth for custom UI string keys.
// Adding a string = add the key here + in src/content/i18n/vi.json + en.json.
export const UI_KEYS = {
  common: ['comingSoon', 'notTranslated', 'learned', 'needsScript', 'lessonsOn', 'formulaLabel'],
  home: [
    'openMap', 'startLearning', 'startLearningLabel', 'linkRoute', 'linkTerms', 'otherLanguage',
    'otherLanguageName', 'quickLinks', 'previous', 'next',
  ],
  notFound: ['title', 'text', 'homeLink'],
  roadmap: [
    'lessons', 'branchNote', 'routeLabel', 'routeResult', 'showOnMap', 'legendOpen', 'legendSoon',
    'legendNone', 'progressSummary', 'progressTotal', 'legendDone',
  ],
  prereq: ['none'],
  quiz: [
    'question', 'check', 'retry', 'chooseOne', 'correct', 'incorrect', 'correctAnswer', 'yourAnswer',
    'explanation', 'score',
  ],
  progress: ['markDone', 'doneStatus', 'storageBlocked'],
  runner: [
    'run', 'stop', 'edit', 'reset', 'retry', 'editorLabel', 'editorHint', 'input',
    'firstRunNote', 'queued', 'loadingPython', 'loadingPackages', 'running', 'longRunning',
    'done', 'stopped', 'loadFailed',
    'output', 'noOutput', 'outputTruncated', 'figure', 'figuresTruncated', 'figuresBeforeError',
    'errorTitle', 'errorLine', 'showTraceback', 'stdinMissing',
    'hintNameError', 'hintSyntaxError', 'hintIndentationError', 'hintTypeError', 'hintValueError',
    'hintIndexError', 'hintKeyError', 'hintAttributeError', 'hintZeroDivisionError',
    'hintModuleNotFoundError', 'hintEOFError', 'hintGeneric',
  ],
  // One namespace per VIZ, named viz<Name> (docs/architecture/viz.md, section 2.6).
  vizLinearFit: [
    'caption', 'plotLabel', 'controls', 'wLabel', 'bLabel', 'wValueText', 'bValueText',
    'yourLine', 'bestLine', 'residual', 'mseValue', 'showBest', 'nearBest', 'bestNote',
    'announce', 'announceBest', 'meanPoint', 'meanNote',
  ],
  vizPolyFit: [
    'caption', 'plotLabel', 'errorLabel', 'errorDesc', 'controls', 'degreeLabel', 'degreeValueText',
    'curve', 'truth', 'showTruth', 'trainMse', 'testMse', 'degreeAxis', 'mseAxis', 'overNote',
    'underfit', 'goodFit', 'overfit', 'bestDegree', 'announce',
  ],
} as const satisfies Record<string, readonly string[]>;

export type UiNamespace = keyof typeof UI_KEYS;
export type UiStrings<N extends UiNamespace> = Record<(typeof UI_KEYS)[N][number], string>;
export type UiKey = {
  [N in UiNamespace]: `atlas.${N}.${(typeof UI_KEYS)[N][number]}`;
}[UiNamespace];

const NAMESPACES = Object.keys(UI_KEYS) as UiNamespace[];

export const ALL_UI_KEYS: UiKey[] = NAMESPACES.flatMap((ns) =>
  UI_KEYS[ns].map((key) => `atlas.${ns}.${key}` as UiKey),
);

/** Returns every string of one namespace, e.g. getStrings(Astro.locals.t, 'quiz'). */
export function getStrings<N extends UiNamespace>(
  t: App.Locals['t'],
  ns: N,
  options?: { lng?: 'vi' | 'en' },
): UiStrings<N> {
  const keys: readonly (typeof UI_KEYS)[N][number][] = UI_KEYS[ns];
  const entries = keys.map((key) => {
    const fullKey = `atlas.${ns}.${key}` as UiKey;
    return [key, options ? t(fullKey, options) : t(fullKey)] as const;
  });
  return Object.fromEntries(entries) as UiStrings<N>;
}
