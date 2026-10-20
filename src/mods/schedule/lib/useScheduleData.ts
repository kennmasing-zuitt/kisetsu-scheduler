"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import {
    useGetBookingsQuery,
    useGetRoomsQuery,
    useGetTherapistsQuery,
} from "@/mods/schedule/scheduleApi";
import type { Booking, BookingRange, Room, Therapist } from "@/mods/schedule/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

// Stable empty lists while loading, so memoized calendar inputs don't change every render
const NO_THERAPISTS: Therapist[] = [];
const NO_ROOMS: Room[] = [];
const NO_BOOKINGS: Booking[] = [];

/**
 * Therapists, rooms and (when `range` is given) the bookings overlapping it. Every component
 * calling this with the same range shares one cached request.
 */
export function useScheduleData(range: BookingRange | null) {
    const therapists = useGetTherapistsQuery();
    const rooms = useGetRoomsQuery();
    const bookings = useGetBookingsQuery(range ?? skipToken);

    const error = (therapists.error ?? rooms.error ?? bookings.error) as GraphqlError | undefined;

    return {
        therapists: therapists.data ?? NO_THERAPISTS,
        rooms: rooms.data ?? NO_ROOMS,
        bookings: bookings.data ?? NO_BOOKINGS,
        /** Roster and rooms not loaded yet (bookings load per range, in the background) */
        isLoading: therapists.isLoading || rooms.isLoading,
        isFetchingBookings: bookings.isFetching,
        error,
    };
}

/** Local midnight of `date` to the next local midnight, as ISO strings. */
export function dayRange(date: Date): BookingRange {
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    return { from: from.toISOString(), to: to.toISOString() };
}
