import type { Booking, Room, Therapist, Weekday } from "@/mods/schedule/types";

/**
 * Availability rules in one place, for instant feedback in the UI (disabled rooms, warnings,
 * blocked drags). The server enforces the same rules on every create/update
 * (kisetsu-scheduler-server: src/mods/schedule/service/impl/assertBookingAllowed.ts) and is the
 * source of truth; keep OPENING_TIME / CLOSING_TIME in sync with its SCHEDULE_* settings.
 */

export const OPENING_TIME = "10:00";
export const CLOSING_TIME = "22:00";

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const ALL_WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/** Local calendar date as "YYYY-MM-DD" (not UTC, so it matches what the user sees). */
export function toDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function isTherapistWorking(therapist: Therapist, date: Date): boolean {
    return (
        !therapist.offDays.includes(date.getDay() as Weekday) &&
        !therapist.leaveDates.includes(toDateKey(date))
    );
}

export function getWorkingTherapists(therapists: Therapist[], date: Date): Therapist[] {
    return therapists.filter((t) => isTherapistWorking(t, date));
}

/** Weekdays a therapist works, for FullCalendar's per-resource businessHours. */
export function workingWeekdays(therapist: Therapist): Weekday[] {
    return ALL_WEEKDAYS.filter((d) => !therapist.offDays.includes(d));
}

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
    aStart < bEnd && bStart < aEnd;

export function isRoomFree(
    roomId: string,
    bookings: Booking[],
    start: Date,
    end: Date,
    ignoreBookingId?: string,
): boolean {
    return !bookings.some(
        (b) =>
            b.id !== ignoreBookingId &&
            b.roomId === roomId &&
            overlaps(Date.parse(b.start), Date.parse(b.end), start.getTime(), end.getTime()),
    );
}

/** First room with no overlapping booking, preferring `preferredRoomId` if it's free. */
export function findFreeRoom(
    rooms: Room[],
    bookings: Booking[],
    start: Date,
    end: Date,
    options: { ignoreBookingId?: string; preferredRoomId?: string } = {},
): Room | undefined {
    const { ignoreBookingId, preferredRoomId } = options;
    const preferred = rooms.filter((r) => r.id === preferredRoomId);
    const ordered = [...preferred, ...rooms.filter((r) => r.id !== preferredRoomId)];
    return ordered.find((r) => isRoomFree(r.id, bookings, start, end, ignoreBookingId));
}

/** True when the therapist has no other booking overlapping [start, end). */
export function isTherapistFree(
    therapistId: string,
    bookings: Booking[],
    start: Date,
    end: Date,
    ignoreBookingId?: string,
): boolean {
    return !bookings.some(
        (b) =>
            b.id !== ignoreBookingId &&
            b.therapistId === therapistId &&
            overlaps(Date.parse(b.start), Date.parse(b.end), start.getTime(), end.getTime()),
    );
}

const minutesOf = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

/** True when [start, end) is on one day and inside OPENING_TIME–CLOSING_TIME. */
export function isWithinOpeningHours(start: Date, end: Date): boolean {
    if (toDateKey(start) !== toDateKey(new Date(end.getTime() - 1))) return false;
    const s = start.getHours() * 60 + start.getMinutes();
    const e = s + Math.round((end.getTime() - start.getTime()) / 60000);
    return s >= minutesOf(OPENING_TIME) && e <= minutesOf(CLOSING_TIME);
}

/** Local time as "HH:MM", for <input type="time">. */
export function toTimeValue(date: Date): string {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** Combine "YYYY-MM-DD" + "HH:MM" into a local Date. */
export function fromDateAndTime(date: string, time: string): Date {
    return new Date(`${date}T${time}:00`);
}
