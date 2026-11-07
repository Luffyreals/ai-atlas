// Starlight route middleware (routeMiddleware in astro.config.ts), run for every Starlight page before render.
// Fallback pages: noindex and no hreflang to a missing translation (decision 30), and out of the search
// index (decision 33). Every page: share tags in the language of its text (og:locale, og:image). The 404
// page: noindex, no canonical or hreflang. See src/lib/seo.ts and docs/architecture/launch.md, section 3.3.2.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { contentLang, fallbackSearchEntry, fallbackSeoHead, notFoundHead, socialHead } from './lib/seo';

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  route.head = fallbackSeoHead(route.head, route);
  route.head = socialHead(route.head, {
    site: context.site!, // always set: astro.config.ts `site: resolveSite(…)`
    lang: contentLang(route),
    isHome: Boolean(route.entry.data.hero),
  });
  route.head = notFoundHead(route.head, route);
  route.entry = fallbackSearchEntry(route.entry, route);
});
