// JSON for an inline <script type="application/json"> (set:html). JSON.stringify leaves "<" alone,
// so a string holding "</script>" or "<!--" would end the element early. "\u003c" parses back to "<".
export function toScriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
