"use client";

import { useState, type FormEvent } from "react";
import Dialog from "@/components/ui/Dialog";
import {
    useCreateTherapistMutation,
    useLazyGetTherapistConflictsQuery,
    useUpdateTherapistMutation,
} from "@/mods/schedule/scheduleApi";
import ConflictList from "./ConflictList";
import { WEEKDAY_LABELS, toDateKey } from "@/mods/schedule/lib/availability";
import type { Booking, Therapist } from "@/mods/schedule/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

const formatDate = (key: string) =>
    new Date(`${key}T00:00:00`).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

/** Add a therapist (`target === "new"`) or edit one: name, weekly days off and leave dates. */
export default function TherapistDialog({
    target,
    onClose,
}: {
    target: Therapist | "new" | null;
    onClose: () => void;
}) {
    return (
        <Dialog open={target !== null} onClose={onClose} labelledBy="therapist-dialog-title">
            {target && (
                <TherapistForm therapist={target === "new" ? undefined : target} onDone={onClose} />
            )}
        </Dialog>
    );
}

function TherapistForm({ therapist, onDone }: { therapist?: Therapist; onDone: () => void }) {
    const [name, setName] = useState(therapist?.name ?? "");
    const [offDays, setOffDays] = useState<number[]>(therapist?.offDays ?? []);
    const [leaveDates, setLeaveDates] = useState<string[]>(therapist?.leaveDates ?? []);
    const [newLeave, setNewLeave] = useState("");

    const [createTherapist, createState] = useCreateTherapistMutation();
    const [updateTherapist, updateState] = useUpdateTherapistMutation();
    const [checkConflicts, checkState] = useLazyGetTherapistConflictsQuery();
    // Bookings the new days off / leave would cancel, shown before saving (null = not checked)
    const [conflicts, setConflicts] = useState<Booking[] | null>(null);
    const [checkedFor, setCheckedFor] = useState("");
    const availabilityKey = JSON.stringify([offDays, leaveDates]);
    if (conflicts && checkedFor !== availabilityKey) {
        // Days off or leave changed after the check: check again on save
        setConflicts(null);
    }
    const saving = createState.isLoading || updateState.isLoading || checkState.isFetching;
    const [error, setError] = useState<string | null>(null);

    // Past leave is kept as history but not listed
    const today = toDateKey(new Date());
    const upcomingLeave = leaveDates.filter((d) => d >= today);
    const pastLeaveCount = leaveDates.length - upcomingLeave.length;

    const toggleDay = (day: number) =>
        setOffDays((days) =>
            days.includes(day)
                ? days.filter((d) => d !== day)
                : [...days, day].sort((a, b) => a - b),
        );

    function addLeave() {
        if (!newLeave || leaveDates.includes(newLeave)) return setNewLeave("");
        setLeaveDates([...leaveDates, newLeave].sort());
        setNewLeave("");
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || saving) return;
        const input = { name: name.trim(), offDays, leaveDates };
        setError(null);
        try {
            if (therapist && !conflicts) {
                const found = await checkConflicts({
                    id: therapist.id,
                    offDays,
                    leaveDates,
                }).unwrap();
                if (found.length) {
                    setConflicts(found);
                    setCheckedFor(availabilityKey);
                    return;
                }
            }
            if (therapist) await updateTherapist({ id: therapist.id, input }).unwrap();
            else await createTherapist(input).unwrap();
            onDone();
        } catch (err) {
            setError((err as GraphqlError).message);
        }
    }

    return (
        <form className="dialog__form" onSubmit={handleSubmit}>
            <header className="dialog__header">
                <h2 id="therapist-dialog-title">
                    {therapist ? "Edit therapist" : "Add therapist"}
                </h2>
                <button type="button" className="icon-btn" onClick={onDone} aria-label="Close">
                    ✕
                </button>
            </header>

            <label className="field">
                <span>Name</span>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                    autoFocus
                />
            </label>

            <fieldset className="field field--plain">
                <legend>Weekly days off</legend>
                <div className="weekdays">
                    {WEEKDAY_LABELS.map((label, i) => {
                        const off = offDays.includes(i);
                        return (
                            <button
                                key={label}
                                type="button"
                                className={off ? "weekday is-off" : "weekday"}
                                aria-pressed={off}
                                title={off ? `${label}: day off` : `${label}: working`}
                                onClick={() => toggleDay(i)}
                            >
                                {label.charAt(0)}
                            </button>
                        );
                    })}
                </div>
            </fieldset>

            <fieldset className="field field--plain">
                <legend>Leave</legend>
                {upcomingLeave.length > 0 ? (
                    <ul className="chips">
                        {upcomingLeave.map((d) => (
                            <li key={d} className="chip">
                                {formatDate(d)}
                                <button
                                    type="button"
                                    aria-label={`Remove leave on ${formatDate(d)}`}
                                    onClick={() => setLeaveDates(leaveDates.filter((x) => x !== d))}
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="muted small">No upcoming leave.</p>
                )}
                {pastLeaveCount > 0 && (
                    <p className="muted small">
                        {pastLeaveCount} past leave day{pastLeaveCount === 1 ? "" : "s"} kept as
                        history.
                    </p>
                )}
                <div className="inline-add">
                    <input
                        type="date"
                        value={newLeave}
                        min={today}
                        onChange={(e) => setNewLeave(e.target.value)}
                        aria-label="Leave date"
                    />
                    <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={addLeave}
                        disabled={!newLeave}
                    >
                        Add leave
                    </button>
                </div>
            </fieldset>

            {error && (
                <p className="alert" role="alert">
                    {error}
                </p>
            )}

            {conflicts && conflicts.length > 0 && <ConflictList bookings={conflicts} />}

            <footer className="dialog__footer">
                <span className="dialog__spacer" />
                <button type="button" className="btn btn--ghost" onClick={onDone}>
                    Cancel
                </button>
                <button
                    className={conflicts?.length ? "btn btn--danger" : "btn btn--primary"}
                    disabled={!name.trim() || saving}
                >
                    {saving
                        ? "Saving…"
                        : conflicts?.length
                          ? `Save and cancel ${conflicts.length}`
                          : therapist
                            ? "Save changes"
                            : "Add therapist"}
                </button>
            </footer>
        </form>
    );
}
