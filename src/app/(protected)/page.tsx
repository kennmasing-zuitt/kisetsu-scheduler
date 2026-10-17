"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

export default function HomePage() {
  const user = useAppSelector((s) => s.auth.user);
  const eventCount = useAppSelector((s) => s.schedule.events.length);

  return (
    <>
      <h1>Hello{user ? `, ${user.name.split(" ")[0]}` : ""} 👋</h1>
      <p className="muted">
        Signed in as {user?.email}
        {user?.role && <> · role <strong>{user.role.name}</strong></>}
      </p>

      <div className="grid">
        <Link href="/users" className="card card--link">
          <h2>Users</h2>
          <p className="muted">Browse accounts from the <code>users</code> query.</p>
        </Link>
        <Link href="/schedule" className="card card--link">
          <h2>Schedule</h2>
          <p className="muted">
            Per-hour calendar · {eventCount} event{eventCount === 1 ? "" : "s"}
          </p>
        </Link>
      </div>
    </>
  );
}
