"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/uiSlice";
import { SIDEBAR_ID } from "./Sidebar";

/** Top bar: sidebar toggle + brand on the left, profile + logout on the right. */
export default function Navbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);

  return (
    <header className="navbar">
      <button
        type="button"
        className="icon-btn"
        onClick={() => dispatch(toggleSidebar())}
        aria-controls={SIDEBAR_ID}
        aria-expanded={sidebarOpen}
        aria-label={sidebarOpen ? "Hide menu" : "Show menu"}
        title={sidebarOpen ? "Hide menu" : "Show menu"}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Link href="/" className="navbar__brand">
        Boilerplate
      </Link>

      <div className="navbar__user">
        {user && (
          <span className="navbar__who">
            <span className="avatar" aria-hidden>
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="navbar__name">{user.name}</span>
            {user.role && <span className="badge">{user.role.name}</span>}
          </span>
        )}
        <Link href="/logout" className="btn btn--ghost">
          Log out
        </Link>
      </div>
    </header>
  );
}
