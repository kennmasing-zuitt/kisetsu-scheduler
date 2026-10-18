"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Phones: below this width the layout switches to its mobile version. */
export const MOBILE_QUERY = "(max-width: 767px)";

/**
 * True while the CSS media query matches. Server render (and the first client
 * render during hydration) assumes it doesn't match, then updates.
 */
export function useMediaQuery(query: string): boolean {
    const subscribe = useCallback(
        (onChange: () => void) => {
            const mql = window.matchMedia(query);
            mql.addEventListener("change", onChange);
            return () => mql.removeEventListener("change", onChange);
        },
        [query],
    );
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(query).matches,
        () => false,
    );
}

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);
