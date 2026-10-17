import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

/** Serializable event shape kept in Redux (ISO strings, not Date objects). */
export interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
}

export interface ScheduleState {
  events: ScheduleEvent[];
}

const todayAt = (h: number) => {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

/**
 * Local-only for now. When the server gets a scheduler module, move these into
 * RTK Query endpoints in store/api.ts and keep this slice for UI state only.
 */
const initialState: ScheduleState = {
  events: [
    { id: "seed-1", title: "Stand-up", start: todayAt(9), end: todayAt(10), allDay: false },
    { id: "seed-2", title: "Deep work", start: todayAt(13), end: todayAt(15), allDay: false },
  ],
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    addEvent: {
      reducer(state, action: PayloadAction<ScheduleEvent>) {
        state.events.push(action.payload);
      },
      prepare(event: Omit<ScheduleEvent, "id">) {
        return { payload: { ...event, id: nanoid() } };
      },
    },
    updateEvent(state, action: PayloadAction<ScheduleEvent>) {
      const i = state.events.findIndex((e) => e.id === action.payload.id);
      if (i !== -1) state.events[i] = action.payload;
    },
    removeEvent(state, action: PayloadAction<string>) {
      state.events = state.events.filter((e) => e.id !== action.payload);
    },
  },
});

export const { addEvent, updateEvent, removeEvent } = scheduleSlice.actions;
export default scheduleSlice.reducer;
