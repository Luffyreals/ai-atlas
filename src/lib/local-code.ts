// Requirement lines of LocalCode (docs/architecture/llm-lessons.md, sections 2.3 and 4.1).
// Pure, relative imports only: e2e tests import this file too.

export interface EnvVar {
  /** e.g. 'OPENAI_API_KEY' */
  name: string;
  /** true when the code only reads it with os.environ.get(...) */
  optional: boolean;
}

// os.environ["X"] (groups 1-2) or os.environ.get("X" (groups 3-4); single or double quotes, spaces allowed.
const ENV_READ =
  /os\.environ\s*(?:\[\s*(['"])([A-Za-z_]\w*)\1\s*\]|\.get\s*\(\s*(['"])([A-Za-z_]\w*)\3)/g;

/**
 * Environment variables read by the code, in order of first appearance, each name once.
 * os.environ["X"] -> required; os.environ.get("X") -> optional (required wins when both appear).
 * Throws when the code calls getenv or imports environ/getenv from os (LocalCode would miss those reads).
 */
export function readEnvVars(code: string): EnvVar[] {
  if (/\bgetenv\b/.test(code) || /^\s*from\s+os\s+import\b.*\b(?:environ|getenv)\b/m.test(code)) {
    throw new Error(
      'the code reads variables through os.getenv, getenv or a bare environ. Read them with os.environ["X"] or os.environ.get("X").',
    );
  }
  const vars = new Map<string, EnvVar>();
  for (const match of code.matchAll(ENV_READ)) {
    const required = match[2] !== undefined;
    const name = match[2] ?? match[4];
    if (name === undefined) continue;
    const seen = vars.get(name);
    if (!seen) vars.set(name, { name, optional: !required });
    else if (required) seen.optional = false;
  }
  return [...vars.values()];
}

// A plain pip name needs no quotes in bash or PowerShell; anything else (>=, [extra], ;, ',', space...) does.
const PLAIN_PACKAGE = /^[A-Za-z0-9._-]+$/;

/**
 * 'pip install openai numpy'; '' for an empty list. A name with any character outside letters, digits,
 * '.', '_' and '-' is wrapped in single quotes, which paste the same into bash and PowerShell:
 * "pip install openai 'gradio>=6'". Throws on an empty or blank name, and on a single quote, tab or line break.
 */
export function pipCommand(packages: readonly string[]): string {
  for (const name of packages) {
    if (!name.trim() || /['\t\r\n]/.test(name)) {
      const rule = 'it must be non-empty, without a single quote, tab or line break.';
      throw new Error(`invalid pip package name ${JSON.stringify(name)}: ${rule}`);
    }
  }
  const words = packages.map((name) => (PLAIN_PACKAGE.test(name) ? name : `'${name}'`));
  return words.length === 0 ? '' : `pip install ${words.join(' ')}`;
}
