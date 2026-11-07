// dist/robots.txt, built from `site` so the Sitemap line follows the domain (docs/architecture/launch.md, section 3.3.4).
import type { APIRoute } from 'astro';
import { robotsTxt } from '@lib/seo';

export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt(site!), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
