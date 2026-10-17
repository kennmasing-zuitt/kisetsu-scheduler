"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

const links = [
  { href: "/", label: "Home" },
  { href: "/users", label: "Users" },
  { href: "/schedule", label: "Schedule" },
];

export default function Navbar() {
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <header className="navbar">
      <Link href="/" className="navbar__brand">
        Boilerplate
      </Link>
      <nav className="navbar__links">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "navbar__link is-active" : "navbar__link"}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="navbar__user">
        {user && (
          <span className="navbar__who">
            {user.name}
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
