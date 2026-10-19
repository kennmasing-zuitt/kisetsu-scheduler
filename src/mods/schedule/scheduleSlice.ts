import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { Booking, Room, Therapist, Weekday } from "@/mods/schedule/types";

export interface ScheduleState {
    therapists: Therapist[];
    rooms: Room[];
    bookings: Booking[];
}

const todayAt = (h: number, m = 0) => {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toISOString();
};

/**
 * Mock data, kept local for now. When the server gets a scheduler module, load
 * therapists / rooms / bookings through RTK Query endpoints in mods/schedule/scheduleApi.ts (via baseApi.injectEndpoints).
 */
const initialState: ScheduleState = {
    therapists: [
        { id: "ana", name: "Ana", offDays: [0], leaveDates: [] }, // off Sun
        { id: "ben", name: "Ben", offDays: [2, 3], leaveDates: [] }, // off Tue, Wed
        { id: "carla", name: "Carla", offDays: [1], leaveDates: [] }, // off Mon
        { id: "dana", name: "Dana", offDays: [6, 0], leaveDates: [] }, // off Sat, Sun
    ],
    rooms: [
        { id: "room-1", name: "Room 1", color: "#534AB7" },
        { id: "room-2", name: "Room 2", color: "#0F6E56" },
        { id: "room-3", name: "Room 3", color: "#993C1D" },
        { id: "room-4", name: "Room 4", color: "#993556" },
    ],
    bookings: [
        {
            id: "b1",
            client: "Mr. Cruz",
            therapistId: "ana",
            roomId: "room-1",
            start: todayAt(15),
            end: todayAt(17, 30),
        },
        {
            id: "b2",
            client: "Ms. Reyes",
            therapistId: "ben",
            roomId: "room-2",
            start: todayAt(15),
            end: todayAt(16),
        },
        {
            id: "b3",
            client: "Mr. Lim",
            therapistId: "ben",
            roomId: "room-2",
            start: todayAt(16, 30),
            end: todayAt(17, 30),
        },
        {
            id: "b4",
            client: "Mrs. Santos",
            therapistId: "carla",
            roomId: "room-3",
            start: todayAt(15, 30),
            end: todayAt(17, 30),
        },
        {
            id: "b5",
            client: "Ms. Tan",
            therapistId: "dana",
            roomId: "room-4",
            start: todayAt(13, 30),
            end: todayAt(14, 30),
        },
    ],
};

const scheduleSlice = createSlice({
    name: "schedule",
    initialState,
    reducers: {
        addBooking: {
            reducer(state, action: PayloadAction<Booking>) {
                state.bookings.push(action.payload);
            },
            prepare(booking: Omit<Booking, "id">) {
                return { payload: { ...booking, id: nanoid() } };
            },
        },
        updateBooking(state, action: PayloadAction<Booking>) {
            const i = state.bookings.findIndex((b) => b.id === action.payload.id);
            if (i !== -1) state.bookings[i] = action.payload;
        },
        removeBooking(state, action: PayloadAction<string>) {
            state.bookings = state.bookings.filter((b) => b.id !== action.payload);
        },
        toggleOffDay(state, action: PayloadAction<{ therapistId: string; weekday: Weekday }>) {
            const t = state.therapists.find((x) => x.id === action.payload.therapistId);
            if (!t) return;
            const { weekday } = action.payload;
            t.offDays = t.offDays.includes(weekday)
                ? t.offDays.filter((d) => d !== weekday)
                : [...t.offDays, weekday].sort();
        },
        toggleLeave(state, action: PayloadAction<{ therapistId: string; date: string }>) {
            const t = state.therapists.find((x) => x.id === action.payload.therapistId);
            if (!t) return;
            const { date } = action.payload;
            t.leaveDates = t.leaveDates.includes(date)
                ? t.leaveDates.filter((d) => d !== date)
                : [...t.leaveDates, date];
        },
    },
});

export const { addBooking, updateBooking, removeBooking, toggleOffDay, toggleLeave } =
    scheduleSlice.actions;
export default scheduleSlice.reducer;
