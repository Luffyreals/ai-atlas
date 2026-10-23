// docs/architecture/viz.md, section 2.8: controls stay disabled in the build HTML and enable right after hydration.
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/** false at build time and during hydration, true right after (useSyncExternalStore, no effect needed). */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, onClient, onServer);
}
