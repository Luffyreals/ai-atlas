import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PYODIDE_INDEX_URL, PYODIDE_VERSION } from '../../../src/lib/pyodide/config';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../../package.json', import.meta.url)), 'utf8'),
) as PackageJson;

const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

describe('dependencies', () => {
  it('pins every version exactly (no ^ or ~)', () => {
    for (const [name, version] of Object.entries(allDeps)) {
      expect(version, name).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it('keeps katex on 0.16.x, the version rehype-katex renders with', () => {
    expect(pkg.dependencies?.katex).toMatch(/^0\.16\./);
  });

  it('pins the pyodide types to the runtime version loaded from the CDN', () => {
    expect(pkg.devDependencies?.pyodide).toBe(PYODIDE_VERSION);
    expect(PYODIDE_INDEX_URL).toContain(`/v${PYODIDE_VERSION}/`);
  });
});
