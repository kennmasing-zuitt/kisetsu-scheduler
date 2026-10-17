/** 0 = Sunday … 6 = Saturday (same as Date#getDay and FullCalendar daysOfWeek) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Therapist {
  id: string;
  name: string;
  /** Recurring weekly days off */
  offDays: Weekday[];
  /** One-off leave, as local dates "YYYY-MM-DD" */
  leaveDates: string[];
}

export interface Room {
  id: string;
  name: string;
  color: string;
}

/** A client booking: one therapist, one room, one time range. Dates are ISO strings. */
export interface Booking {
  id: string;
  client: string;
  therapistId: string;
  roomId: string;
  start: string;
  end: string;
}
