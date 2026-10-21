import type { Client } from "@/mods/clients/types";

const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

const shortDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

/**
 * "Juan Dela Cruz · 4th visit · last Oct 2, 2026 · usually Ana (asked for 2×)" for the
 * booking dialog. `forNewBooking` counts the booking being made as the next visit.
 */
export default function ClientMatch({
    client,
    forNewBooking,
}: {
    client: Client;
    forNewBooking: boolean;
}) {
    const { stats } = client;
    const parts = [
        forNewBooking
            ? stats.visits === 0
                ? "first visit"
                : `${ordinal(stats.visits + 1)} visit`
            : `${stats.visits} visit${stats.visits === 1 ? "" : "s"} so far`,
        stats.lastVisit && `last ${shortDate(stats.lastVisit)}`,
        stats.favouriteTherapistName && `usually ${stats.favouriteTherapistName}`,
        stats.requested > 0 && `asked for a therapist ${stats.requested}×`,
    ].filter(Boolean);

    return (
        <div className="client-match" role="status">
            <strong>{client.fullName}</strong>
            <span className="muted small"> · {parts.join(" · ")}</span>
            {client.notes && <p className="client-match__notes small">{client.notes}</p>}
        </div>
    );
}
