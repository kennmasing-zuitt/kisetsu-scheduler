import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BookingRange } from "@/mods/schedule/types";

/**
 * Client-only schedule state. The data itself (therapists, rooms, bookings) lives on the server
 * and is loaded through RTK Query (mods/schedule/scheduleApi.ts).
 */
export interface ScheduleState {
    /** The dates the calendar shows; the page and the calendar query bookings for it. */
    range: BookingRange | null;
}

const initialState: ScheduleState = { range: null };

const scheduleSlice = createSlice({
    name: "schedule",
    initialState,
    reducers: {
        setRange(state, action: PayloadAction<BookingRange>) {
            // Same dates: keep the old object so the bookings query args don't change
            if (state.range?.from === action.payload.from && state.range.to === action.payload.to)
                return;
            state.range = action.payload;
        },
    },
});

export const { setRange } = scheduleSlice.actions;
export default scheduleSlice.reducer;

export const selectVisibleRange = (s: { schedule: ScheduleState }) => s.schedule.range;
