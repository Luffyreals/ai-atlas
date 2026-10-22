// Fills i18next-style placeholders, e.g. formatString('{{count}} bài', { count: 7 }).
// Used where a raw template travels to the browser or is reused with many values.
export function formatString(template: string, vars: Record<string, string | number>): string {
  // Own keys only: a template is data, and "{{constructor}}" must not reach Object.prototype.
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match: string, name: string) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : match,
  );
}
