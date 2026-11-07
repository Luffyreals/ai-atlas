// The one source of the site's origin (docs/architecture/launch.md, section 3.3.1). astro.config.ts sets
// `site: resolveSite(process.env.SITE_URL)`; every other file reads it from Astro (`Astro.site`, `context.site`).
// Loaded by astro.config.ts: no imports at all, so it stays a pure function.

/** Used when SITE_URL is missing or empty, e.g. a local build. */
export const DEFAULT_SITE = 'https://ai-atlas.pages.dev';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/**
 * SITE_URL → an origin without a trailing slash, e.g. 'https://ai-atlas.pages.dev'. Throws (the build stops)
 * on anything that is not an absolute https origin: another protocol, a path other than '/', a query or a
 * hash. http://localhost and http://127.0.0.1 are allowed, for trying a build on this machine.
 */
export function resolveSite(raw: string | undefined): string {
  const value = (raw ?? '').trim();
  if (value === '') return DEFAULT_SITE;

  const fail = (reason: string): never => {
    throw new Error(`SITE_URL "${value}" ${reason}. Expected an origin such as ${DEFAULT_SITE}.`);
  };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return fail('is not an absolute URL');
  }
  const isLocal = url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname);
  if (url.protocol !== 'https:' && !isLocal) fail('must use https: (http: only for localhost)');
  if (url.username !== '' || url.password !== '') fail('must not carry a user name or password');
  if (url.pathname !== '/') fail('must not have a path');
  if (url.search !== '' || value.includes('?')) fail('must not have a query');
  if (url.hash !== '' || value.includes('#')) fail('must not have a hash');
  return url.origin;
}
