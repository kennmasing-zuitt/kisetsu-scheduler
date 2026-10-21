"use client";

import type { Booking } from "@/mods/schedule/types";

const when = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

/** "These bookings will be cancelled and the clients texted to rebook" */
export default function ConflictList({ bookings }: { bookings: Booking[] }) {
    return (
        <div className="notice" role="alert">
            <p className="small" style={{ marginBottom: 6 }}>
                <strong>
                    {bookings.length === 1
                        ? "1 upcoming booking"
                        : `${bookings.length} upcoming bookings`}{" "}
                    will be cancelled
                </strong>{" "}
                and each client gets a text asking them to rebook:
            </p>
            <ul className="conflict-list">
                {bookings.map((b) => (
                    <li key={b.id}>
                        {when(b.start)} · {b.client}
                        {b.source === "client" ? " (booked online)" : ""}
                    </li>
                ))}
            </ul>
        </div>
    );
}
