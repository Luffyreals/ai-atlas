// "Pyodide has loaded once on this page": shared by every PythonRunner island, because they all import
// this one module. Used to hide runner.firstRunNote everywhere after the first successful load.
import { useSyncExternalStore } from 'react';

let ready = false;
const listeners = new Set<() => void>();

export function markPythonReady(): void {
  if (ready) return;
  ready = true;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** false at build time and during hydration (server snapshot), so the first render matches the HTML. */
export function usePythonReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false,
  );
}

/** For tests: back to "not loaded yet". */
export function resetPythonReady(): void {
  ready = false;
  for (const listener of listeners) listener();
}
