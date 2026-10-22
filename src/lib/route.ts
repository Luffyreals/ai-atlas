// Route finding on the prerequisite graph. Pure and DOM-free: used at build time by
// RoadmapMap and in the browser by its route finder script.

/**
 * Returns the target plus every lesson it transitively depends on.
 * `prerequisitesOf` returns the direct prerequisites of an id ([] for unknown ids).
 */
export function routeTo(
  target: string,
  prerequisitesOf: (id: string) => readonly string[],
): Set<string> {
  const route = new Set<string>();
  const stack = [target];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (route.has(id)) continue;
    route.add(id);
    for (const prerequisite of prerequisitesOf(id)) {
      if (!route.has(prerequisite)) stack.push(prerequisite);
    }
  }
  return route;
}

/** Number of distinct parts on a route, using the "<part>/<slug>" id format. */
export function countParts(route: Iterable<string>): number {
  const parts = new Set<string>();
  for (const id of route) parts.add(id.slice(0, id.indexOf('/')));
  return parts.size;
}
