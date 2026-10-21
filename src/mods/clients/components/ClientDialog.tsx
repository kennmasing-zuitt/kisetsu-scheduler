"use client";

import { useState, type FormEvent } from "react";
import Dialog from "@/components/ui/Dialog";
import {
    useGetClientBookingsQuery,
    useResetClientAppMutation,
    useUpdateClientMutation,
} from "@/mods/clients/clientsApi";
import { MOBILE_HINT, formatMobile, normalizeMobile } from "@/mods/clients/lib/mobile";
import { useScheduleData } from "@/mods/schedule/lib/useScheduleData";
import type { Client } from "@/mods/clients/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

const when = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

/** A client's details (editable with updateClient), visit counts and recent bookings. */
export default function ClientDialog({
    client,
    canEdit,
    onClose,
}: {
    client: Client | null;
    canEdit: boolean;
    onClose: () => void;
}) {
    return (
        <Dialog open={client !== null} onClose={onClose} labelledBy="client-dialog-title" wide>
            {client && <ClientForm client={client} canEdit={canEdit} onDone={onClose} />}
        </Dialog>
    );
}

function ClientForm({
    client,
    canEdit,
    onDone,
}: {
    client: Client;
    canEdit: boolean;
    onDone: () => void;
}) {
    const [firstName, setFirstName] = useState(client.firstName);
    const [lastName, setLastName] = useState(client.lastName);
    const [mobile, setMobile] = useState(formatMobile(client.mobile));
    const [notes, setNotes] = useState(client.notes);
    const [updateClient, { isLoading }] = useUpdateClientMutation();
    const [resetApp, resetState] = useResetClientAppMutation();
    // The dialog shows the client as opened; reflect a reset straight away
    const [appEnabledAt, setAppEnabledAt] = useState(client.appEnabledAt ?? null);
    const [confirmReset, setConfirmReset] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: bookings = [], isLoading: loadingBookings } = useGetClientBookingsQuery(
        client.id,
    );
    const { therapists, services } = useScheduleData(null);
    const therapistName = new Map(therapists.map((t) => [t.id, t.name]));
    const serviceName = new Map(services.map((s) => [s.id, s.name]));
    // "Upcoming" vs "Visited" relative to when the dialog opened
    const [now] = useState(() => Date.now());

    const normalized = normalizeMobile(mobile);
    const problems: string[] = [];
    if (!firstName.trim()) problems.push("Enter the first name.");
    if (!normalized) problems.push(MOBILE_HINT);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!canEdit || problems.length || isLoading) return;
        setError(null);
        try {
            await updateClient({
                id: client.id,
                input: {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    notes: notes.trim(),
                    ...(normalized !== client.mobile ? { mobile: normalized } : {}),
                },
            }).unwrap();
            onDone();
        } catch (err) {
            setError((err as GraphqlError).message);
        }
    }

    const { stats } = client;
    return (
        <form className="dialog__form" onSubmit={handleSubmit}>
            <header className="dialog__header">
                <h2 id="client-dialog-title">{client.fullName}</h2>
                <button type="button" className="icon-btn" onClick={onDone} aria-label="Close">
                    ✕
                </button>
            </header>

            <dl className="client-stats">
                <div>
                    <dt>Visits</dt>
                    <dd>{stats.visits}</dd>
                </div>
                <div>
                    <dt>Upcoming</dt>
                    <dd>{stats.upcoming}</dd>
                </div>
                <div>
                    <dt>Asked for a therapist</dt>
                    <dd>{stats.requested}×</dd>
                </div>
                <div>
                    <dt>Usually with</dt>
                    <dd>{stats.favouriteTherapistName ?? "—"}</dd>
                </div>
            </dl>

            <div className="field-row">
                <label className="field">
                    <span>First name</span>
                    <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!canEdit}
                        maxLength={100}
                        required
                    />
                </label>
                <label className="field">
                    <span>Last name</span>
                    <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!canEdit}
                        maxLength={100}
                    />
                </label>
            </div>
            <label className="field">
                <span>Mobile</span>
                <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={!canEdit}
                />
            </label>
            <label className="field">
                <span>Notes</span>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!canEdit}
                    maxLength={1000}
                    rows={2}
                    placeholder="Preferences, pressure, anything the front desk should know"
                />
            </label>

            <div className="client-app">
                <span>
                    <strong>Online booking app: </strong>
                    {appEnabledAt
                        ? `set up ${new Date(appEnabledAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
                        : "not set up (the client can set it up at kisetsuspa.com/book)"}
                </span>
                {canEdit && appEnabledAt && !confirmReset && (
                    <button
                        type="button"
                        className="btn btn--sm btn--ghost"
                        onClick={() => setConfirmReset(true)}
                    >
                        Reset (lost phone)
                    </button>
                )}
                {canEdit && appEnabledAt && confirmReset && (
                    <span className="row-actions">
                        <button
                            type="button"
                            className="btn btn--sm btn--ghost"
                            onClick={() => setConfirmReset(false)}
                        >
                            Keep
                        </button>
                        <button
                            type="button"
                            className="btn btn--sm btn--danger"
                            disabled={resetState.isLoading}
                            onClick={async () => {
                                try {
                                    await resetApp(client.id).unwrap();
                                    setAppEnabledAt(null);
                                    setConfirmReset(false);
                                } catch (err) {
                                    setError((err as GraphqlError).message);
                                }
                            }}
                        >
                            Turn off app sign-in
                        </button>
                    </span>
                )}
            </div>

            <section className="field field--plain">
                <span>Recent bookings</span>
                {loadingBookings ? (
                    <p className="muted small">Loading…</p>
                ) : bookings.length === 0 ? (
                    <p className="muted small">No bookings yet.</p>
                ) : (
                    <div className="table-wrap client-bookings">
                        <table className="table">
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id}>
                                        <td>{when(b.start)}</td>
                                        <td>
                                            {b.serviceId
                                                ? (serviceName.get(b.serviceId) ?? "—")
                                                : "—"}
                                        </td>
                                        <td>
                                            {b.isRequested ? "★ " : ""}
                                            {therapistName.get(b.therapistId) ??
                                                "Removed therapist"}
                                        </td>
                                        <td>{b.promoCode ?? ""}</td>
                                        <td className="muted">
                                            {b.status === "cancelled"
                                                ? "Cancelled"
                                                : Date.parse(b.end) > now
                                                  ? "Upcoming"
                                                  : "Visited"}
                                            {b.source === "client" ? " · online" : ""}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {canEdit && (problems.length > 0 || error) && (
                <ul className="alert dialog__problems" role="alert">
                    {problems.map((p) => (
                        <li key={p}>{p}</li>
                    ))}
                    {error && <li>{error}</li>}
                </ul>
            )}

            <footer className="dialog__footer">
                <span className="dialog__spacer" />
                <button type="button" className="btn btn--ghost" onClick={onDone}>
                    Close
                </button>
                {canEdit && (
                    <button
                        className="btn btn--primary"
                        disabled={problems.length > 0 || isLoading}
                    >
                        {isLoading ? "Saving…" : "Save changes"}
                    </button>
                )}
            </footer>
        </form>
    );
}
