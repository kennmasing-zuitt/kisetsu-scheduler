"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./index";
import { hydrate, type AuthState } from "./authSlice";

const STORAGE_KEY = "auth";

/**
 * Creates the store once per tab, restores the saved session from localStorage,
 * and keeps localStorage in sync whenever the auth slice changes.
 */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  useEffect(() => {
    const store = storeRef.current!;

    let saved: Pick<AuthState, "accessToken" | "user"> | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      saved = raw ? JSON.parse(raw) : null;
    } catch {
      saved = null;
    }
    store.dispatch(hydrate(saved));

    let last = store.getState().auth;
    return store.subscribe(() => {
      const { auth } = store.getState();
      if (auth === last) return;
      last = auth;
      try {
        if (auth.accessToken) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ accessToken: auth.accessToken, user: auth.user }),
          );
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        /* storage unavailable (private mode) — session just won't persist */
      }
    });
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
