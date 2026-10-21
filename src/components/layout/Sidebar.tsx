"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarOpen } from "@/store/uiSlice";
// Below MOBILE_QUERY the sidebar overlays the page instead of pushing it.
import { MOBILE_QUERY } from "@/lib/useMediaQuery";

export const SIDEBAR_ID = "app-sidebar";

const icon = (d: string) => (
    <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
    >
        <path d={d} />
    </svg>
);

/** Add a page here and it shows up in the sidebar. */
const navItems = [
    { href: "/", label: "Home", icon: icon("M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10") },
    {
        href: "/users",
        label: "Users",
        icon: icon(
            "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
        ),
    },
    {
        href: "/schedule",
        label: "Schedule",
        icon: icon("M4 5h16v15H4zM4 10h16M8 3v4M16 3v4"),
    },
    {
        href: "/clients",
        label: "Clients",
        icon: icon("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"),
    },
    {
        href: "/reports",
        label: "Reports",
        icon: icon("M4 20V10M10 20V4M16 20v-7M22 20H2"),
    },
    {
        href: "/manage",
        label: "Manage",
        icon: icon("M4 6h16M4 12h16M4 18h10M18 16v4M16 18h4"),
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const open = useAppSelector((s) => s.ui.sidebarOpen);

    // On small screens the sidebar is an overlay, so close it after navigating.
    const closeIfMobile = () => {
        if (window.matchMedia(MOBILE_QUERY).matches) dispatch(setSidebarOpen(false));
    };

    return (
        <>
            <aside
                id={SIDEBAR_ID}
                className={open ? "sidebar is-open" : "sidebar"}
                aria-label="Main navigation"
                inert={!open}
            >
                <nav className="sidebar__nav">
                    {navItems.map((item) => {
                        const active =
                            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeIfMobile}
                                className={active ? "sidebar__link is-active" : "sidebar__link"}
                                aria-current={active ? "page" : undefined}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile-only backdrop (hidden by CSS on wider screens) */}
            {open && (
                <div
                    className="sidebar__backdrop"
                    onClick={() => dispatch(setSidebarOpen(false))}
                    aria-hidden
                />
            )}
        </>
    );
}
