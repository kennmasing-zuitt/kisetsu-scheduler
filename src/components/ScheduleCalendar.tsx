"use client";

import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import type { DateSelectInfo, EventChangeInfo, EventClickInfo, EventInput } from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import classicThemePlugin from "@fullcalendar/react/themes/classic";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addEvent, removeEvent, updateEvent } from "@/store/scheduleSlice";

/**
 * Per-hour calendar (FullCalendar v7 time grid, 1-hour slots).
 * - Drag across slots to create an event
 * - Drag / resize an event to move it
 * - Click an event to delete it
 * Events live in Redux (store/scheduleSlice.ts).
 */
export default function ScheduleCalendar() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((s) => s.schedule.events);

  // FullCalendar mutates what it's given, so hand it copies of the frozen Redux objects.
  const calendarEvents = useMemo<EventInput[]>(() => events.map((e) => ({ ...e })), [events]);

  function handleSelect(info: DateSelectInfo) {
    info.view.calendar.unselect();
    const title = window.prompt("Event title");
    if (!title?.trim()) return;
    dispatch(
      addEvent({
        title: title.trim(),
        start: info.start.toISOString(),
        end: info.end.toISOString(),
        allDay: info.allDay,
      }),
    );
  }

  function handleEventClick({ event }: EventClickInfo) {
    if (window.confirm(`Delete "${event.title}"?`)) dispatch(removeEvent(event.id));
  }

  function handleEventChange({ event }: EventChangeInfo) {
    dispatch(
      updateEvent({
        id: event.id,
        title: event.title,
        start: event.start!.toISOString(),
        end: (event.end ?? event.start)!.toISOString(),
        allDay: event.allDay,
      }),
    );
  }

  return (
    <FullCalendar
      plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin, classicThemePlugin]}
      initialView="timeGridDay"
      headerToolbar={{
        start: "prev,next today",
        center: "title",
        end: "timeGridDay,timeGridWeek,dayGridMonth",
      }}
      slotDuration="01:00:00"
      slotMinTime="00:00:00"
      slotMaxTime="24:00:00"
      scrollTime="08:00:00"
      allDaySlot
      nowIndicator
      selectable
      selectMirror
      editable
      height="auto"
      events={calendarEvents}
      select={handleSelect}
      eventClick={handleEventClick}
      eventChange={handleEventChange}
    />
  );
}
