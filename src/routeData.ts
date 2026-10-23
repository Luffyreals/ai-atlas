// Starlight route middleware (routeMiddleware in astro.config.ts), run for every Starlight page before render.
// Fallback pages: noindex and no hreflang to a missing translation (decision 30), and out of the search
// index (decision 33). See src/lib/seo.ts.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { fallbackSearchEntry, fallbackSeoHead } from './lib/seo';

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  route.head = fallbackSeoHead(route.head, route);
  route.entry = fallbackSearchEntry(route.entry, route);
});
