/**
 * App-facing schedule types, derived from the codegen output in src/gql.
 * Don't hand-edit shapes here: change mods/schedule/graphql/*.graphql and run `npm run codegen`.
 */
import type {
    BookingFieldsFragment,
    RoomFieldsFragment,
    TherapistFieldsFragment,
} from "@/gql/graphql";

export type {
    CreateBookingInput,
    CreateRoomInput,
    CreateTherapistInput,
    UpdateBookingInput,
    UpdateRoomInput,
    UpdateTherapistInput,
} from "@/gql/graphql";

/** 0 = Sunday … 6 = Saturday (same as Date#getDay and FullCalendar daysOfWeek) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** { id, name, offDays (weekly days off), leaveDates ("YYYY-MM-DD") } */
export type Therapist = TherapistFieldsFragment;

/** { id, name, color } */
export type Room = RoomFieldsFragment;

/** A client booking: one therapist, one room, one time range. Dates are ISO strings. */
export type Booking = BookingFieldsFragment;

/** A window of time as ISO strings: bookings overlapping [from, to) */
export interface BookingRange {
    from: string;
    to: string;
}
