"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import type {
  CalendarRef,
  DateSelectInfo,
  DateSpanApi,
  DatesSetInfo,
  EventChangeInfo,
  EventClickInfo,
  EventInput,
} from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/react/interaction";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import resourceTimeGridPlugin from "@fullcalendar/react-scheduler/resource-timegrid";
import type { ResourceFuncInfo, ResourceInput } from "@fullcalendar/react-scheduler";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addBooking, removeBooking, updateBooking } from "@/store/scheduleSlice";
import {
  CLOSING_TIME,
  OPENING_TIME,
  findFreeRoom,
  getWorkingTherapists,
  isTherapistWorking,
  toDateKey,
  workingWeekdays,
} from "@/lib/availability";

const DAY_MS = 24 * 60 * 60 * 1000;

// Premium resource views need a license key. The non-commercial key is fine for
// development; set NEXT_PUBLIC_FULLCALENDAR_LICENSE_KEY to your commercial key in production.
const LICENSE_KEY =
  process.env.NEXT_PUBLIC_FULLCALENDAR_LICENSE_KEY ?? "CC-Attribution-NonCommercial-NoDerivatives";

export interface VisibleRange {
  start: Date;
  end: Date;
  viewType: string;
}

/**
 * Per-hour schedule with one column per therapist (FullCalendar resource time grid).
 *
 * - Day view: only therapists working that day get a column (off-days and leave remove it).
 * - Week view: columns can't change per day, so off-days are greyed out via businessHours
 *   and leave days via background events; bookings there are blocked.
 * - Drag across a column to book (a free room is picked automatically), drag/resize to move,
 *   click to cancel.
 */
export default function ScheduleCalendar({
  onRangeChange,
}: {
  onRangeChange?: (range: VisibleRange) => void;
}) {
  const dispatch = useAppDispatch();
  const { therapists, rooms, bookings } = useAppSelector((s) => s.schedule);
  const calendarRef = useRef<CalendarRef>(null);

  const therapistById = useMemo(() => new Map(therapists.map((t) => [t.id, t])), [therapists]);
  const roomById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);

  /**
   * Called by FullCalendar on load and on every navigation (refetchResourcesOnNavigate).
   * This is the function to back with a GraphQL query later.
   */
  const resources = useCallback(
    async ({ start, end }: ResourceFuncInfo): Promise<ResourceInput[]> => {
      if (!start || !end) return [];
      const isSingleDay = end.getTime() - start.getTime() <= DAY_MS;
      const list = isSingleDay ? getWorkingTherapists(therapists, start) : therapists;
      return list.map((t) => ({
        id: t.id,
        title: t.name,
        businessHours: {
          daysOfWeek: workingWeekdays(t),
          startTime: OPENING_TIME,
          endTime: CLOSING_TIME,
        },
      }));
    },
    [therapists],
  );

  // Off-days / leave were edited: ask FullCalendar for the columns again.
  useEffect(() => {
    calendarRef.current?.getApi().refetchResources();
  }, [therapists]);

  const events = useMemo<EventInput[]>(() => {
    const bookingEvents: EventInput[] = bookings.map((b) => {
      const room = roomById.get(b.roomId);
      return {
        id: b.id,
        title: `${b.client} · ${room?.name ?? "No room"}`,
        start: b.start,
        end: b.end,
        resourceId: b.therapistId,
        backgroundColor: room?.color,
        borderColor: room?.color,
      };
    });
    // Grey "On leave" blocks, only visible in week view (in day view the column is gone).
    const leaveEvents: EventInput[] = therapists.flatMap((t) =>
      t.leaveDates.map((date) => ({
        id: `leave-${t.id}-${date}`,
        resourceId: t.id,
        start: `${date}T00:00:00`,
        end: `${date}T23:59:59`,
        display: "background",
        title: "On leave",
        backgroundColor: "#888780",
      })),
    );
    return [...bookingEvents, ...leaveEvents];
  }, [bookings, therapists, roomById]);

  /** Shared rule for creating and moving bookings. */
  const canBook = (span: DateSpanApi) => {
    const therapist = span.resource && therapistById.get(span.resource.id);
    const sameDay = toDateKey(span.start) === toDateKey(new Date(span.end.getTime() - 1));
    return Boolean(therapist && sameDay && isTherapistWorking(therapist, span.start));
  };

  function handleSelect(info: DateSelectInfo) {
    info.view.calendar.unselect();
    const therapistId = info.resource?.id;
    if (!therapistId) return;

    const room = findFreeRoom(rooms, bookings, info.start, info.end);
    if (!room) {
      window.alert("No room is free at that time.");
      return;
    }
    const client = window.prompt(`Client name (${room.name})`);
    if (!client?.trim()) return;

    dispatch(
      addBooking({
        client: client.trim(),
        therapistId,
        roomId: room.id,
        start: info.start.toISOString(),
        end: info.end.toISOString(),
      }),
    );
  }

  function handleEventClick({ event }: EventClickInfo) {
    if (event.display === "background") return;
    const booking = bookings.find((b) => b.id === event.id);
    if (booking && window.confirm(`Cancel ${booking.client}'s booking?`)) {
      dispatch(removeBooking(booking.id));
    }
  }

  function handleEventChange({ event, revert }: EventChangeInfo) {
    const booking = bookings.find((b) => b.id === event.id);
    if (!booking || !event.start) return revert();
    const start = event.start;
    const end = event.end ?? start;

    // Keep the same room if it's still free at the new time, otherwise pick another.
    const room = findFreeRoom(rooms, bookings, start, end, {
      ignoreBookingId: booking.id,
      preferredRoomId: booking.roomId,
    });
    if (!room) {
      window.alert("No room is free at that time.");
      return revert();
    }
    dispatch(
      updateBooking({
        ...booking,
        therapistId: event.getResources()[0]?.id ?? booking.therapistId,
        roomId: room.id,
        start: start.toISOString(),
        end: end.toISOString(),
      }),
    );
  }

  function handleDatesSet({ start, end, view }: DatesSetInfo) {
    onRangeChange?.({ start, end, viewType: view.type });
  }

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[resourceTimeGridPlugin, interactionPlugin, classicThemePlugin]}
      schedulerLicenseKey={LICENSE_KEY}
      initialView="resourceTimeGridDay"
      headerToolbar={{
        start: "prev,next today",
        center: "title",
        end: "resourceTimeGridDay,resourceTimeGridWeek",
      }}
      buttons={{
        resourceTimeGridDay: { text: "Day" },
        resourceTimeGridWeek: { text: "Week" },
      }}
      resources={resources}
      refetchResourcesOnNavigate
      events={events}
      slotDuration="01:00:00"
      slotMinTime="09:00:00"
      slotMaxTime="23:00:00"
      scrollTime="13:00:00"
      allDaySlot={false}
      nowIndicator
      selectable
      selectMirror
      editable
      selectOverlap={false}
      eventOverlap={false}
      selectAllow={canBook}
      eventAllow={(span) => canBook(span)}
      height="auto"
      datesSet={handleDatesSet}
      select={handleSelect}
      eventClick={handleEventClick}
      eventChange={handleEventChange}
    />
  );
}
