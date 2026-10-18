"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./index";
import { hydrate, type AuthState } from "./authSlice";
import { setSidebarOpen } from "./uiSlice";

const AUTH_KEY = "auth";
const SIDEBAR_KEY = "sidebarOpen";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — preference just won't persist */
  }
}

/**
 * Creates the store once per tab, restores the saved session and sidebar
 * preference from localStorage, and keeps both in sync as they change.
 */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer: makeStore runs once per tab, and the same store is reused on re-renders
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    store.dispatch(hydrate(readJson<Pick<AuthState, "accessToken" | "user">>(AUTH_KEY)));

    // Saved choice wins; otherwise open on desktop, closed on phones.
    const savedSidebar = readJson<boolean>(SIDEBAR_KEY);
    store.dispatch(
      setSidebarOpen(savedSidebar ?? !window.matchMedia("(max-width: 767px)").matches),
    );

    let { auth: lastAuth, ui: lastUi } = store.getState();
    return store.subscribe(() => {
      const { auth, ui } = store.getState();
      if (auth !== lastAuth) {
        lastAuth = auth;
        write(
          AUTH_KEY,
          auth.accessToken ? { accessToken: auth.accessToken, user: auth.user } : null,
        );
      }
      if (ui !== lastUi) {
        lastUi = ui;
        write(SIDEBAR_KEY, ui.sidebarOpen);
      }
    });
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
