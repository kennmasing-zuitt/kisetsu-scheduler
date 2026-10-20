"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
    useCreateBookingMutation,
    useDeleteBookingMutation,
    useUpdateBookingMutation,
} from "@/mods/schedule/scheduleApi";
import { dayRange, useScheduleData } from "@/mods/schedule/lib/useScheduleData";
import type { Booking } from "@/mods/schedule/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";
import {
    findServicePrice,
    formatPeso,
    hasAnyLengthPrice,
    priceDayOf,
    pricedDurationsOn,
} from "@/mods/schedule/lib/pricing";
import {
    CLOSING_TIME,
    OPENING_TIME,
    findFreeRoom,
    fromDateAndTime,
    isRoomFree,
    isTherapistFree,
    isTherapistWorking,
    isWithinOpeningHours,
    toDateKey,
    toTimeValue,
} from "@/mods/schedule/lib/availability";

/** What the dialog opens with: a new slot, or an existing booking to edit. */
export interface BookingDraft {
    /** Set when editing: the booking as it was when the dialog opened */
    booking?: Booking;
    therapistId: string;
    start: Date;
    durationMin: number;
}

const DURATION_PRESETS = [30, 45, 60, 80, 90, 120, 150, 180];

export const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(" ") || "0m";
};

const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/**
 * Create / edit / cancel a booking in a native <dialog>, saved through the GraphQL API.
 * Rooms already taken at the chosen time are disabled; the form checks the therapist's
 * off-days, leave, double-booking and opening hours before saving, and shows the server's
 * error if it still refuses (e.g. someone else booked the slot meanwhile).
 */
export default function BookingDialog({
    draft,
    onClose,
}: {
    draft: BookingDraft | null;
    onClose: () => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (draft && !dialog.open) dialog.showModal();
        if (!draft && dialog.open) dialog.close();
    }, [draft]);

    return (
        <dialog
            ref={ref}
            className="dialog"
            onClose={onClose}
            onClick={(e) => e.target === ref.current && ref.current?.close()} // click on backdrop
            aria-labelledby="booking-dialog-title"
        >
            {/* Remount the form for each draft so its fields reset */}
            {draft && (
                <BookingForm
                    key={`${draft.booking?.id ?? "new"}-${draft.start.getTime()}-${draft.therapistId}`}
                    draft={draft}
                    onDone={() => ref.current?.close()}
                />
            )}
        </dialog>
    );
}

function BookingForm({ draft, onDone }: { draft: BookingDraft; onDone: () => void }) {
    const existing = draft.booking;
    const ignoreId = existing?.id;

    const initialDuration = draft.durationMin;
    const [client, setClient] = useState(existing?.client ?? "");
    const [therapistId, setTherapistId] = useState(draft.therapistId);
    const [date, setDate] = useState(toDateKey(draft.start));
    const [time, setTime] = useState(toTimeValue(draft.start));

    // Bookings on the chosen day (shared with the calendar's cache in Day view)
    const range = useMemo(() => {
        const day = fromDateAndTime(date, "00:00");
        return Number.isNaN(day.getTime()) ? null : dayRange(day);
    }, [date]);
    const { therapists, rooms, bookings, services } = useScheduleData(range);
    const [serviceId, setServiceId] = useState(existing?.serviceId ?? "");

    const [createBooking, createState] = useCreateBookingMutation();
    const [updateBooking, updateState] = useUpdateBookingMutation();
    const [deleteBooking, deleteState] = useDeleteBookingMutation();
    const saving = createState.isLoading || updateState.isLoading || deleteState.isLoading;
    const [serverError, setServerError] = useState<string | null>(null);
    const [durationMin, setDurationMin] = useState(initialDuration);
    const [customDuration, setCustomDuration] = useState(
        !DURATION_PRESETS.includes(initialDuration),
    );
    // The room the user picked (or the first free one when the dialog opened)
    const [chosenRoomId, setRoomId] = useState<string>(() => {
        if (existing) return existing.roomId;
        const end = new Date(draft.start.getTime() + initialDuration * 60000);
        return findFreeRoom(rooms, bookings, draft.start, end)?.id ?? "";
    });
    const [confirmingCancel, setConfirmingCancel] = useState(false);

    const start = useMemo(() => fromDateAndTime(date, time), [date, time]);
    const end = useMemo(
        () => new Date(start.getTime() + durationMin * 60000),
        [start, durationMin],
    );
    const validTime = !Number.isNaN(start.getTime()) && durationMin > 0;

    const therapist = therapists.find((t) => t.id === therapistId);

    // Price: the service's rule for this date, weekday and length (same lookup as the server)
    const service = services.find((s) => s.id === serviceId);
    const priceDay = validTime ? priceDayOf(start) : null;
    const price =
        service && priceDay ? findServicePrice(service.prices, priceDay, durationMin) : undefined;
    // Services sold in fixed lengths (Fuyu: 60 / 80 min) offer only those; "any length" ones
    // (Aki) keep the free duration presets
    const fixedLengths =
        service && priceDay && !hasAnyLengthPrice(service.prices, priceDay)
            ? pricedDurationsOn(service.prices, priceDay)
            : null;
    // Offered: active services, plus the booking's current one even if archived since
    const offered = services.filter((s) => s.isActive || s.id === existing?.serviceId);

    function chooseService(id: string) {
        setServiceId(id);
        const next = services.find((s) => s.id === id);
        if (!next || !priceDay || hasAnyLengthPrice(next.prices, priceDay)) return;
        const lengths = pricedDurationsOn(next.prices, priceDay);
        if (lengths.length && !lengths.includes(durationMin)) {
            setDurationMin(lengths[0]);
            setCustomDuration(false);
        }
    }
    const roomTaken = (id: string) => validTime && !isRoomFree(id, bookings, start, end, ignoreId);

    // The room actually used: the chosen one while it's free; if a time change makes it
    // taken, fall back to a free room (derived during render, so no effect is needed).
    const roomId =
        !validTime || (chosenRoomId && !roomTaken(chosenRoomId))
            ? chosenRoomId
            : (findFreeRoom(rooms, bookings, start, end, { ignoreBookingId: ignoreId })?.id ?? "");

    const problems: string[] = [];
    if (!validTime) problems.push("Enter a valid date, time and duration.");
    else {
        if (!isWithinOpeningHours(start, end))
            problems.push(
                `Bookings must fit between ${OPENING_TIME} and ${CLOSING_TIME} on one day.`,
            );
        if (therapist && !isTherapistWorking(therapist, start))
            problems.push(`${therapist.name} is off on that day.`);
        if (therapist && !isTherapistFree(therapist.id, bookings, start, end, ignoreId))
            problems.push(`${therapist.name} already has a booking at that time.`);
        if (!roomId) problems.push("No room is free at that time.");
        else if (roomTaken(roomId)) problems.push("That room is already booked at that time.");
        if (!service) problems.push("Choose a service.");
        else if (!price)
            problems.push(
                fixedLengths?.length
                    ? `${service.name} isn't offered for ${formatDuration(durationMin)} on that date.`
                    : `${service.name} has no price on that date.`,
            );
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (problems.length || !client.trim() || saving) return;
        const input = {
            client: client.trim(),
            therapistId,
            roomId,
            serviceId,
            start: start.toISOString(),
            end: end.toISOString(),
        };
        setServerError(null);
        try {
            if (existing) await updateBooking({ id: existing.id, input }).unwrap();
            else await createBooking(input).unwrap();
            onDone();
        } catch (err) {
            setServerError((err as GraphqlError).message);
        }
    }

    async function handleCancelBooking() {
        if (!existing || saving) return;
        if (!confirmingCancel) return setConfirmingCancel(true);
        setServerError(null);
        try {
            await deleteBooking(existing.id).unwrap();
            onDone();
        } catch (err) {
            setServerError((err as GraphqlError).message);
        }
    }

    return (
        <form className="dialog__form" onSubmit={handleSubmit}>
            <header className="dialog__header">
                <h2 id="booking-dialog-title">{existing ? "Edit booking" : "New booking"}</h2>
                <button type="button" className="icon-btn" onClick={onDone} aria-label="Close">
                    ✕
                </button>
            </header>

            <label className="field">
                <span>Client</span>
                <input
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    required
                    autoFocus
                />
            </label>

            <label className="field">
                <span>Service</span>
                <select value={serviceId} onChange={(e) => chooseService(e.target.value)} required>
                    {!service && <option value="">Choose a service…</option>}
                    {offered.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                            {s.isActive ? "" : " (no longer offered)"}
                        </option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>Therapist</span>
                <select value={therapistId} onChange={(e) => setTherapistId(e.target.value)}>
                    {therapists.map((t) => {
                        const off = validTime && !isTherapistWorking(t, start);
                        return (
                            <option key={t.id} value={t.id}>
                                {t.name}
                                {off ? " (off this day)" : ""}
                            </option>
                        );
                    })}
                </select>
            </label>

            <div className="field-row">
                <label className="field">
                    <span>Date</span>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </label>
                <label className="field">
                    <span>Start</span>
                    <input
                        type="time"
                        value={time}
                        step={600}
                        min={OPENING_TIME}
                        max={CLOSING_TIME}
                        onChange={(e) => setTime(e.target.value)}
                        required
                    />
                </label>
            </div>

            <div className="field-row">
                <label className="field">
                    <span>Duration</span>
                    {fixedLengths ? (
                        <select
                            value={String(durationMin)}
                            onChange={(e) => {
                                setCustomDuration(false);
                                setDurationMin(Number(e.target.value));
                            }}
                        >
                            {!fixedLengths.includes(durationMin) && (
                                <option value={durationMin}>
                                    {formatDuration(durationMin)} (not offered)
                                </option>
                            )}
                            {fixedLengths.map((m) => {
                                const rule = findServicePrice(service!.prices, priceDay!, m);
                                return (
                                    <option key={m} value={m}>
                                        {formatDuration(m)}
                                        {rule ? ` · ${formatPeso(rule.amount)}` : ""}
                                    </option>
                                );
                            })}
                        </select>
                    ) : (
                        <select
                            value={customDuration ? "custom" : String(durationMin)}
                            onChange={(e) => {
                                if (e.target.value === "custom") return setCustomDuration(true);
                                setCustomDuration(false);
                                setDurationMin(Number(e.target.value));
                            }}
                        >
                            {DURATION_PRESETS.map((m) => (
                                <option key={m} value={m}>
                                    {formatDuration(m)}
                                </option>
                            ))}
                            <option value="custom">Custom…</option>
                        </select>
                    )}
                </label>
                {customDuration && !fixedLengths ? (
                    <label className="field">
                        <span>Minutes</span>
                        <input
                            type="number"
                            min={10}
                            max={600}
                            step={10}
                            value={durationMin}
                            onChange={(e) => setDurationMin(Math.max(0, Number(e.target.value)))}
                        />
                    </label>
                ) : (
                    <div className="field field--readonly">
                        <span>Ends</span>
                        <output>{validTime ? formatTime(end) : "—"}</output>
                    </div>
                )}
            </div>

            <label className="field">
                <span>Room</span>
                <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                    {!roomId && <option value="">No free room</option>}
                    {rooms.map((r) => {
                        const taken = roomTaken(r.id);
                        return (
                            <option key={r.id} value={r.id} disabled={taken}>
                                {r.name}
                                {taken ? " (booked)" : ""}
                            </option>
                        );
                    })}
                </select>
            </label>

            {price && (
                <p className="dialog__price">
                    <span className="muted">Price</span> <strong>{formatPeso(price.amount)}</strong>
                </p>
            )}

            {validTime && customDuration && !fixedLengths && (
                <p className="muted dialog__summary">
                    {formatTime(start)} – {formatTime(end)} · {formatDuration(durationMin)}
                </p>
            )}

            {(problems.length > 0 || serverError) && (
                <ul className="alert dialog__problems" role="alert">
                    {problems.map((p) => (
                        <li key={p}>{p}</li>
                    ))}
                    {serverError && <li>{serverError}</li>}
                </ul>
            )}

            <footer className="dialog__footer">
                {existing && (
                    <button
                        type="button"
                        className="btn btn--danger"
                        onClick={handleCancelBooking}
                        disabled={saving}
                    >
                        {deleteState.isLoading
                            ? "Cancelling…"
                            : confirmingCancel
                              ? "Confirm cancel"
                              : "Cancel booking"}
                    </button>
                )}
                <span className="dialog__spacer" />
                <button type="button" className="btn btn--ghost" onClick={onDone}>
                    Close
                </button>
                <button
                    className="btn btn--primary"
                    disabled={problems.length > 0 || !client.trim() || saving}
                >
                    {createState.isLoading || updateState.isLoading
                        ? "Saving…"
                        : existing
                          ? "Save changes"
                          : "Book"}
                </button>
            </footer>
        </form>
    );
}
