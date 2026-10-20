"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/ui/Loader";
import TherapistPanel from "@/mods/schedule/components/TherapistPanel";
import BookingDialog, { type BookingDraft } from "@/mods/schedule/components/BookingDialog";
import { useAppSelector } from "@/store/hooks";
import { selectVisibleRange } from "@/mods/schedule/scheduleSlice";
import { useScheduleData } from "@/mods/schedule/lib/useScheduleData";
import {
    getWorkingTherapists,
    isTherapistWorking,
    toDateKey,
} from "@/mods/schedule/lib/availability";

// FullCalendar touches the DOM, so render it on the client only.
const ScheduleCalendar = dynamic(() => import("@/mods/schedule/components/ScheduleCalendar"), {
    ssr: false,
    loading: () => <Loader label="Loading calendar…" />,
});

export default function SchedulePage() {
    const [draft, setDraft] = useState<BookingDraft | null>(null);
    // The calendar writes its visible dates to the schedule slice; same range = same cached query
    const range = useAppSelector(selectVisibleRange);
    const { therapists, bookings, isLoading, error } = useScheduleData(range);
    const day = useMemo(() => (range ? new Date(range.from) : new Date()), [range]);

    // Bookings in view whose therapist is off that day have no column to show in, so flag them.
    const hidden = useMemo(() => {
        if (!range) return [];
        const from = new Date(range.from);
        const to = new Date(range.to);
        return bookings.filter((b) => {
            const start = new Date(b.start);
            if (start < from || start >= to) return false;
            const t = therapists.find((x) => x.id === b.therapistId);
            return !t || !isTherapistWorking(t, start);
        });
    }, [range, bookings, therapists]);

    // Header button: 3 PM on the visible day, first therapist working that day.
    function openNewBooking() {
        const start = new Date(day);
        start.setHours(15, 0, 0, 0);
        const therapist = getWorkingTherapists(therapists, start)[0] ?? therapists[0];
        if (therapist) setDraft({ therapistId: therapist.id, start, durationMin: 60 });
    }

    if (isLoading) return <Loader label="Loading schedule…" />;

    return (
        <>
            <div className="page__header">
                <div>
                    <h1>Schedule</h1>
                    <p className="muted">
                        Drag down a therapist&apos;s column or click a booking to edit it
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn--primary"
                    onClick={openNewBooking}
                    disabled={therapists.length === 0}
                >
                    + New booking
                </button>
            </div>

            {error && (
                <p className="alert" role="alert">
                    Couldn&apos;t load the schedule: {error.message}
                </p>
            )}

            {!error && therapists.length === 0 && (
                <p className="alert" role="status">
                    No therapists yet. Add some on the server (run <code>npm run seed</code> for
                    sample therapists and rooms).
                </p>
            )}

            {hidden.length > 0 && (
                <p className="alert" role="status">
                    {hidden.length} booking{hidden.length === 1 ? " is" : "s are"} assigned to a
                    therapist who is off:{" "}
                    {hidden.map((b) => `${b.client} (${toDateKey(new Date(b.start))})`).join(", ")}.
                    Reassign or cancel {hidden.length === 1 ? "it" : "them"}.
                </p>
            )}

            <div className="schedule-layout">
                <div className="card calendar-card">
                    <ScheduleCalendar onOpenBooking={setDraft} />
                </div>
                <TherapistPanel date={day} />
            </div>

            <BookingDialog draft={draft} onClose={() => setDraft(null)} />
        </>
    );
}
