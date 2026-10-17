"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addBooking, removeBooking, updateBooking } from "@/store/scheduleSlice";
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
} from "@/lib/availability";

/** What the dialog opens with: a new slot, or an existing booking to edit. */
export interface BookingDraft {
  bookingId?: string;
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
 * Create / edit / cancel a booking in a native <dialog>.
 * Rooms already taken at the chosen time are disabled; the form checks the therapist's
 * off-days, leave, double-booking and opening hours before saving.
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
          key={`${draft.bookingId ?? "new"}-${draft.start.getTime()}-${draft.therapistId}`}
          draft={draft}
          onDone={() => ref.current?.close()}
        />
      )}
    </dialog>
  );
}

function BookingForm({ draft, onDone }: { draft: BookingDraft; onDone: () => void }) {
  const dispatch = useAppDispatch();
  const { therapists, rooms, bookings } = useAppSelector((s) => s.schedule);
  const existing = draft.bookingId ? bookings.find((b) => b.id === draft.bookingId) : undefined;
  const ignoreId = existing?.id;

  const initialDuration = draft.durationMin;
  const [client, setClient] = useState(existing?.client ?? "");
  const [therapistId, setTherapistId] = useState(draft.therapistId);
  const [date, setDate] = useState(toDateKey(draft.start));
  const [time, setTime] = useState(toTimeValue(draft.start));
  const [durationMin, setDurationMin] = useState(initialDuration);
  const [customDuration, setCustomDuration] = useState(!DURATION_PRESETS.includes(initialDuration));
  const [roomId, setRoomId] = useState<string>(() => {
    if (existing) return existing.roomId;
    const end = new Date(draft.start.getTime() + initialDuration * 60000);
    return findFreeRoom(rooms, bookings, draft.start, end)?.id ?? "";
  });
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const start = useMemo(() => fromDateAndTime(date, time), [date, time]);
  const end = useMemo(() => new Date(start.getTime() + durationMin * 60000), [start, durationMin]);
  const validTime = !Number.isNaN(start.getTime()) && durationMin > 0;

  const therapist = therapists.find((t) => t.id === therapistId);
  const roomTaken = (id: string) => validTime && !isRoomFree(id, bookings, start, end, ignoreId);

  // If the chosen room becomes unavailable after changing time, switch to a free one.
  useEffect(() => {
    if (!validTime || (roomId && !roomTaken(roomId))) return;
    const free = findFreeRoom(rooms, bookings, start, end, { ignoreBookingId: ignoreId });
    setRoomId(free?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start.getTime(), end.getTime()]);

  const problems: string[] = [];
  if (!validTime) problems.push("Enter a valid date, time and duration.");
  else {
    if (!isWithinOpeningHours(start, end))
      problems.push(`Bookings must fit between ${OPENING_TIME} and ${CLOSING_TIME} on one day.`);
    if (therapist && !isTherapistWorking(therapist, start))
      problems.push(`${therapist.name} is off on that day.`);
    if (therapist && !isTherapistFree(therapist.id, bookings, start, end, ignoreId))
      problems.push(`${therapist.name} already has a booking at that time.`);
    if (!roomId) problems.push("No room is free at that time.");
    else if (roomTaken(roomId)) problems.push("That room is already booked at that time.");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (problems.length || !client.trim()) return;
    const data = {
      client: client.trim(),
      therapistId,
      roomId,
      start: start.toISOString(),
      end: end.toISOString(),
    };
    dispatch(existing ? updateBooking({ ...data, id: existing.id }) : addBooking(data));
    onDone();
  }

  function handleCancelBooking() {
    if (!existing) return;
    if (!confirmingCancel) return setConfirmingCancel(true);
    dispatch(removeBooking(existing.id));
    onDone();
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
        <input value={client} onChange={(e) => setClient(e.target.value)} required autoFocus />
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
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
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
        </label>
        {customDuration ? (
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

      {validTime && customDuration && (
        <p className="muted dialog__summary">
          {formatTime(start)} – {formatTime(end)} · {formatDuration(durationMin)}
        </p>
      )}

      {problems.length > 0 && (
        <ul className="alert dialog__problems" role="alert">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <footer className="dialog__footer">
        {existing && (
          <button type="button" className="btn btn--danger" onClick={handleCancelBooking}>
            {confirmingCancel ? "Confirm cancel" : "Cancel booking"}
          </button>
        )}
        <span className="dialog__spacer" />
        <button type="button" className="btn btn--ghost" onClick={onDone}>
          Close
        </button>
        <button className="btn btn--primary" disabled={problems.length > 0 || !client.trim()}>
          {existing ? "Save changes" : "Book"}
        </button>
      </footer>
    </form>
  );
}
