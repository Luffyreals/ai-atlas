// docs/architecture/viz/README.md, section 2.7: a live region speaks once the reader stops dragging, not on every step.
import { useEffect, useRef, useState } from 'react';

export const SETTLE_MS = 600;

/**
 * `value` once it has stayed the same for `delay` ms; undefined until the first change after mount.
 * Compared with Object.is, so pass a primitive (a number or a string key), not a fresh object.
 */
export function useSettled<T>(value: T, delay: number = SETTLE_MS): T | undefined {
  const [settled, setSettled] = useState<T | undefined>(undefined);
  const start = useRef(value);
  const moved = useRef(false);

  useEffect(() => {
    // Nothing to say about the value the page loaded with, until it changes once.
    if (!moved.current && Object.is(value, start.current)) return;
    moved.current = true;
    const timer = window.setTimeout(() => setSettled(() => value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return settled;
}
