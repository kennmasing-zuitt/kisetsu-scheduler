"use client";

import { useEffect, useMemo, useRef } from "react";
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
// Needed for dayMinWidth (columns keep a minimum width and the grid scrolls sideways)
import scrollGridPlugin from "@fullcalendar/react-scheduler/scrollgrid";
import type { ResourceInput } from "@fullcalendar/react-scheduler";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectVisibleRange, setRange } from "@/mods/schedule/scheduleSlice";
import { useUpdateBookingMutation } from "@/mods/schedule/scheduleApi";
import { useScheduleData } from "@/mods/schedule/lib/useScheduleData";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";
import type { BookingDraft } from "./BookingDialog";
import {
    CLOSING_TIME,
    OPENING_TIME,
    findFreeRoom,
    getWorkingTherapists,
    isTherapistWorking,
    toDateKey,
    workingWeekdays,
} from "@/mods/schedule/lib/availability";
import { useIsMobile } from "@/lib/useMediaQuery";
import type { Therapist } from "@/mods/schedule/types";

const DAY_MS = 24 * 60 * 60 * 1000;

// Premium resource views need a license key. The non-commercial key is fine for
// development; set NEXT_PUBLIC_FULLCALENDAR_LICENSE_KEY to your commercial key in production.
const LICENSE_KEY =
    process.env.NEXT_PUBLIC_FULLCALENDAR_LICENSE_KEY ??
    "CC-Attribution-NonCommercial-NoDerivatives";

/** Therapists as calendar columns: in a single-day view, only those working that day. */
function toResources(therapists: Therapist[], start: Date, end: Date): ResourceInput[] {
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
}

/**
 * Per-hour schedule with one column per therapist (FullCalendar resource time grid).
 *
 * - Day view: only therapists working that day get a column (off-days and leave remove it).
 * - Week view: columns can't change per day, so off-days are greyed out via businessHours
 *   and leave days via background events; bookings there are blocked.
 * - Drag down a column (10-minute steps) to open the booking dialog, click a booking to
 *   edit or cancel it, drag/resize to move it (saved right away; reverted if the server refuses).
 * - The visible dates go to the schedule slice, so the page and this calendar share one
 *   `bookings(from, to)` query per view.
 * - Phones: Day view only, compact toolbar, columns keep a minimum width and the grid
 *   scrolls sideways, and a shorter long-press starts a drag on touch screens.
 */
export default function ScheduleCalendar({
    onOpenBooking,
}: {
    /** Open the booking dialog for a new slot or an existing booking. */
    onOpenBooking: (draft: BookingDraft) => void;
}) {
    const dispatch = useAppDispatch();
    const range = useAppSelector(selectVisibleRange);
    const { therapists, rooms, bookings, services } = useScheduleData(range);
    const [updateBooking] = useUpdateBookingMutation();
    const calendarRef = useRef<CalendarRef>(null);
    const isMobile = useIsMobile();

    // Week view is unusable on a phone (therapists x 7 days of columns), so switch to Day.
    useEffect(() => {
        const api = calendarRef.current?.getApi();
        if (isMobile && api && api.view.type !== "resourceTimeGridDay") {
            api.changeView("resourceTimeGridDay");
        }
    }, [isMobile]);

    const therapistById = useMemo(() => new Map(therapists.map((t) => [t.id, t])), [therapists]);
    const roomById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
    const serviceById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);

    // The dates on screen, kept in sync by datesSet. Starts as today (the initial Day view).
    const visible = useMemo(() => {
        if (range) return { start: new Date(range.from), end: new Date(range.to) };
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return { start, end: new Date(start.getTime() + DAY_MS) };
    }, [range]);

    /**
     * Therapist columns for the visible dates, recomputed when the dates or the roster change.
     *
     * Passed as a plain array on purpose: a resources *function* that answers asynchronously
     * makes FullCalendar v7 update itself before it has mounted, which React reports as
     * "Can't perform a React state update on a component that hasn't mounted yet".
     * Therapists come from RTK Query (getTherapists) and are passed on as an array.
     */
    const resources = useMemo(
        () => toResources(therapists, visible.start, visible.end),
        [therapists, visible],
    );

    const events = useMemo<EventInput[]>(() => {
        const bookingEvents: EventInput[] = bookings.map((b) => {
            const room = roomById.get(b.roomId);
            return {
                id: b.id,
                title: [
                    b.client,
                    b.serviceId ? serviceById.get(b.serviceId)?.name : null,
                    room?.name ?? "No room",
                ]
                    .filter(Boolean)
                    .join(" · "),
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
    }, [bookings, therapists, roomById, serviceById]);

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
        onOpenBooking({
            therapistId,
            start: info.start,
            durationMin: Math.round((info.end.getTime() - info.start.getTime()) / 60000),
        });
    }

    function handleEventClick({ event }: EventClickInfo) {
        if (event.display === "background") return;
        const booking = bookings.find((b) => b.id === event.id);
        if (!booking) return;
        const start = new Date(booking.start);
        onOpenBooking({
            booking,
            therapistId: booking.therapistId,
            start,
            durationMin: Math.round((Date.parse(booking.end) - start.getTime()) / 60000),
        });
    }

    async function handleEventChange({ event, revert }: EventChangeInfo) {
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
        try {
            await updateBooking({
                id: booking.id,
                input: {
                    therapistId: event.getResources()[0]?.id ?? booking.therapistId,
                    roomId: room.id,
                    start: start.toISOString(),
                    end: end.toISOString(),
                },
            }).unwrap();
        } catch (err) {
            revert();
            window.alert((err as GraphqlError).message);
        }
    }

    function handleDatesSet({ start, end }: DatesSetInfo) {
        // The slice ignores unchanged dates, so re-renders don't loop
        dispatch(setRange({ from: start.toISOString(), to: end.toISOString() }));
    }

    return (
        <FullCalendar
            ref={calendarRef}
            plugins={[
                resourceTimeGridPlugin,
                scrollGridPlugin,
                interactionPlugin,
                classicThemePlugin,
            ]}
            schedulerLicenseKey={LICENSE_KEY}
            initialView="resourceTimeGridDay"
            headerToolbar={
                isMobile
                    ? { start: "prev,next", center: "title", end: "today" }
                    : {
                          start: "prev,next today",
                          center: "title",
                          end: "resourceTimeGridDay,resourceTimeGridWeek",
                      }
            }
            // Short title on phones ("Sat, Oct 17") so the toolbar fits on one row
            {...(isMobile
                ? { titleFormat: { weekday: "short", month: "short", day: "numeric" } }
                : {})}
            // Columns never get narrower than this; the grid scrolls sideways instead
            dayMinWidth={isMobile ? 110 : 100}
            // Touch: hold 300ms (default 1s) before dragging a booking or selecting a slot
            longPressDelay={300}
            buttons={{
                resourceTimeGridDay: { text: "Day" },
                resourceTimeGridWeek: { text: "Week" },
            }}
            resources={resources}
            events={events}
            slotDuration="01:00:00"
            snapDuration="00:10:00" // drag, move and resize in 10-minute steps
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
