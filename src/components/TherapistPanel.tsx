"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleLeave, toggleOffDay } from "@/store/scheduleSlice";
import { WEEKDAY_LABELS, isTherapistWorking, toDateKey } from "@/lib/availability";
import type { Weekday } from "@/types/schedule";

/**
 * Roster for the visible day: weekly off-days and one-off leave.
 * Edits update Redux, and the calendar re-asks for its columns.
 * Later these become mutations on the backend.
 */
export default function TherapistPanel({ date }: { date: Date }) {
  const dispatch = useAppDispatch();
  const { therapists, rooms } = useAppSelector((s) => s.schedule);
  const dateKey = toDateKey(date);
  const dateLabel = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  return (
    <aside className="card roster">
      <h2>Therapists</h2>
      <p className="muted roster__hint">Weekly days off, and leave on {dateLabel}</p>

      <ul className="roster__list">
        {therapists.map((t) => {
          const working = isTherapistWorking(t, date);
          const onLeave = t.leaveDates.includes(dateKey);
          return (
            <li key={t.id} className="roster__item">
              <div className="roster__row">
                <span className="roster__name">{t.name}</span>
                <span className={working ? "status status--on" : "status status--off"}>
                  {working ? "Working" : onLeave ? "On leave" : "Day off"}
                </span>
              </div>

              <div className="weekdays" role="group" aria-label={`${t.name}'s days off`}>
                {WEEKDAY_LABELS.map((label, i) => {
                  const off = t.offDays.includes(i as Weekday);
                  return (
                    <button
                      key={label}
                      type="button"
                      className={off ? "weekday is-off" : "weekday"}
                      aria-pressed={off}
                      title={off ? `${label}: day off` : `${label}: working`}
                      onClick={() => dispatch(toggleOffDay({ therapistId: t.id, weekday: i as Weekday }))}
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
                  onChange={() => dispatch(toggleLeave({ therapistId: t.id, date: dateKey }))}
                />
                On leave {dateLabel}
              </label>
            </li>
          );
        })}
      </ul>

      <h2 className="roster__rooms-title">Rooms</h2>
      <ul className="legend">
        {rooms.map((r) => (
          <li key={r.id}>
            <i style={{ background: r.color }} aria-hidden /> {r.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
