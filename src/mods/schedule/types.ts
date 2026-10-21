/**
 * App-facing schedule types, derived from the codegen output in src/gql.
 * Don't hand-edit shapes here: change mods/schedule/graphql/*.graphql and run `npm run codegen`.
 */
import type {
    BookingFieldsFragment,
    PromoFieldsFragment,
    RoomFieldsFragment,
    ServiceFieldsFragment,
    ServicePriceFieldsFragment,
    TherapistFieldsFragment,
} from "@/gql/graphql";

export type {
    CreateBookingInput,
    CreatePromoInput,
    CreateRoomInput,
    CreateServiceInput,
    CreateTherapistInput,
    ServicePriceInput,
    UpdateBookingInput,
    UpdatePromoInput,
    UpdateRoomInput,
    UpdateServiceInput,
    UpdateTherapistInput,
} from "@/gql/graphql";

/** 0 = Sunday … 6 = Saturday (same as Date#getDay and FullCalendar daysOfWeek) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** { id, name, offDays (weekly days off), leaveDates ("YYYY-MM-DD") } */
export type Therapist = TherapistFieldsFragment;

/** { id, name, color } */
export type Room = RoomFieldsFragment;

/** { id, name, description, isActive, prices } */
export type Service = ServiceFieldsFragment;

/**
 * One price rule: `amount` (PHP) for bookings of `durationMin` minutes (null = any length) on
 * `days` (empty = every day), from `validFrom` to `validTo` (null = still current), as local
 * dates "YYYY-MM-DD".
 */
export type ServicePrice = ServicePriceFieldsFragment;

/**
 * A promo code: `value`% or ₱`value` off (`discountType`), usable from `validFrom` to `validTo`
 * on `serviceIds` (empty = all). Once used (`isLocked`), code, discount and services are fixed.
 */
export type Promo = PromoFieldsFragment;

/** A client booking: one therapist, one room, one service, one time range. Dates are ISO strings. */
export type Booking = BookingFieldsFragment;

/** A window of time as ISO strings: bookings overlapping [from, to) */
export interface BookingRange {
    from: string;
    to: string;
}
