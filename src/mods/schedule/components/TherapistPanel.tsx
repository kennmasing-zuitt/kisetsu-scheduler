"use client";

import { useId, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import {
    useLazyGetTherapistConflictsQuery,
    useUpdateTherapistMutation,
} from "@/mods/schedule/scheduleApi";
import ConflictList from "./ConflictList";
import { useScheduleData } from "@/mods/schedule/lib/useScheduleData";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";
import { WEEKDAY_LABELS, isTherapistWorking, toDateKey } from "@/mods/schedule/lib/availability";
import type { Booking, Therapist, UpdateTherapistInput, Weekday } from "@/mods/schedule/types";
import { useIsMobile } from "@/lib/useMediaQuery";

/**
 * Roster for the visible day: weekly off-days and one-off leave.
 * Each toggle is an `updateTherapist` mutation; the cached roster is patched optimistically,
 * so the calendar columns change straight away (and change back if the server refuses).
 * Collapsible: closed by default on phones (it sits below a tall calendar), open on desktop.
 */
export default function TherapistPanel({ date }: { date: Date }) {
    const { therapists, rooms } = useScheduleData(null);
    const [updateTherapist, { error }] = useUpdateTherapistMutation();
    const [checkConflicts] = useLazyGetTherapistConflictsQuery();
    // A change that would cancel bookings waits here for confirmation
    const [pending, setPending] = useState<{
        therapist: Therapist;
        input: UpdateTherapistInput;
        conflicts: Booking[];
    } | null>(null);
    const dateKey = toDateKey(date);
    const dateLabel = date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    const isMobile = useIsMobile();
    const [expandedChoice, setExpandedChoice] = useState<boolean | null>(null);
    const expanded = expandedChoice ?? !isMobile; // until the user toggles, follow the screen size
    const bodyId = useId();
    const offToday = therapists.filter((t) => !isTherapistWorking(t, date)).length;

    /** Saves straight away, unless it would cancel bookings: then asks first. */
    async function change(t: Therapist, input: UpdateTherapistInput) {
        let conflicts: Booking[] = [];
        try {
            conflicts = await checkConflicts({
                id: t.id,
                offDays: input.offDays ?? null,
                leaveDates: input.leaveDates ?? null,
            }).unwrap();
        } catch {
            /* couldn't check: the save itself will report problems */
        }
        if (conflicts.length) setPending({ therapist: t, input, conflicts });
        else updateTherapist({ id: t.id, input });
    }

    function toggleOffDay(t: Therapist, weekday: Weekday) {
        const offDays = t.offDays.includes(weekday)
            ? t.offDays.filter((d) => d !== weekday)
            : [...t.offDays, weekday].sort((a, b) => a - b);
        change(t, { offDays });
    }

    function toggleLeave(t: Therapist) {
        const leaveDates = t.leaveDates.includes(dateKey)
            ? t.leaveDates.filter((d) => d !== dateKey)
            : [...t.leaveDates, dateKey].sort();
        change(t, { leaveDates });
    }

    return (
        <aside className="card roster">
            <h2 className="roster__heading">
                <button
                    type="button"
                    className="roster__toggle"
                    aria-expanded={expanded}
                    aria-controls={bodyId}
                    onClick={() => setExpandedChoice(!expanded)}
                >
                    <span>Therapists</span>
                    <span className="muted roster__count">
                        {therapists.length - offToday} working{offToday ? ` · ${offToday} off` : ""}
                    </span>
                    <span
                        className={expanded ? "roster__chevron is-open" : "roster__chevron"}
                        aria-hidden
                    >
                        ▾
                    </span>
                </button>
            </h2>

            <div id={bodyId} className="roster__body" hidden={!expanded}>
                <p className="muted roster__hint">Weekly days off, and leave on {dateLabel}</p>
                {error && (
                    <p className="alert" role="alert">
                        {(error as GraphqlError).message}
                    </p>
                )}

                <ul className="roster__list">
                    {therapists.map((t) => {
                        const working = isTherapistWorking(t, date);
                        const onLeave = t.leaveDates.includes(dateKey);
                        return (
                            <li key={t.id} className="roster__item">
                                <div className="roster__row">
                                    <span className="roster__name">{t.name}</span>
                                    <span
                                        className={
                                            working ? "status status--on" : "status status--off"
                                        }
                                    >
                                        {working ? "Working" : onLeave ? "On leave" : "Day off"}
                                    </span>
                                </div>

                                <div
                                    className="weekdays"
                                    role="group"
                                    aria-label={`${t.name}'s days off`}
                                >
                                    {WEEKDAY_LABELS.map((label, i) => {
                                        const off = t.offDays.includes(i as Weekday);
                                        return (
                                            <button
                                                key={label}
                                                type="button"
                                                className={off ? "weekday is-off" : "weekday"}
                                                aria-pressed={off}
                                                title={
                                                    off ? `${label}: day off` : `${label}: working`
                                                }
                                                onClick={() => toggleOffDay(t, i as Weekday)}
                                            >
                                                {label.charAt(0)}
                                            </button>
                                        );
                                    })}
                                </div>

                                <label className="roster__leave">
                                    <input
                                        type="checkbox"
                                        checked={onLeave}
                                        onChange={() => toggleLeave(t)}
                                    />
                                    On leave {dateLabel}
                                </label>
                            </li>
                        );
                    })}
                </ul>

                <Dialog
                    open={pending !== null}
                    onClose={() => setPending(null)}
                    labelledBy="conflicts-title"
                >
                    {pending && (
                        <div className="dialog__form">
                            <header className="dialog__header">
                                <h2 id="conflicts-title">
                                    {pending.therapist.name} has bookings then
                                </h2>
                            </header>
                            <ConflictList bookings={pending.conflicts} />
                            <footer className="dialog__footer">
                                <span className="dialog__spacer" />
                                <button
                                    type="button"
                                    className="btn btn--ghost"
                                    onClick={() => setPending(null)}
                                >
                                    Keep as is
                                </button>
                                <button
                                    type="button"
                                    className="btn btn--danger"
                                    onClick={() => {
                                        updateTherapist({
                                            id: pending.therapist.id,
                                            input: pending.input,
                                        });
                                        setPending(null);
                                    }}
                                >
                                    Cancel {pending.conflicts.length} and text clients
                                </button>
                            </footer>
                        </div>
                    )}
                </Dialog>

                <h2 className="roster__rooms-title">Rooms</h2>
                <ul className="legend">
                    {rooms.map((r) => (
                        <li key={r.id}>
                            <i style={{ background: r.color }} aria-hidden /> {r.name}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
