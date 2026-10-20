"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { useGetBookingsQuery } from "@/mods/schedule/scheduleApi";
import { dayRange } from "@/mods/schedule/lib/useScheduleData";

export default function HomePage() {
    const user = useAppSelector((s) => s.auth.user);
    const [today] = useState(() => dayRange(new Date()));
    const { data: todaysBookings } = useGetBookingsQuery(today);
    const eventCount = todaysBookings?.length;

    return (
        <>
            <h1>Hello{user ? `, ${user.name.split(" ")[0]}` : ""} 👋</h1>
            <p className="muted">
                Signed in as {user?.email}
                {user?.role && (
                    <>
                        {" "}
                        · role <strong>{user.role.name}</strong>
                    </>
                )}
            </p>

            <div className="grid">
                <Link href="/users" className="card card--link">
                    <h2>Users</h2>
                    <p className="muted">
                        Browse accounts from the <code>users</code> query.
                    </p>
                </Link>
                <Link href="/schedule" className="card card--link">
                    <h2>Schedule</h2>
                    <p className="muted">
                        Therapist schedule
                        {eventCount !== undefined &&
                            ` · ${eventCount} booking${eventCount === 1 ? "" : "s"} today`}
                    </p>
                </Link>
            </div>
        </>
    );
}
