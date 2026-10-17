"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/Loader";
import TherapistPanel from "@/components/TherapistPanel";
import type { VisibleRange } from "@/components/ScheduleCalendar";
import { useAppSelector } from "@/store/hooks";
import { isTherapistWorking, toDateKey } from "@/lib/availability";

// FullCalendar touches the DOM, so render it on the client only.
const ScheduleCalendar = dynamic(() => import("@/components/ScheduleCalendar"), {
  ssr: false,
  loading: () => <Loader label="Loading calendar…" />,
});

export default function SchedulePage() {
  const [range, setRange] = useState<VisibleRange | null>(null);
  const { therapists, bookings } = useAppSelector((s) => s.schedule);
  const day = range?.start ?? new Date();

  // Bookings in view whose therapist is off that day have no column to show in, so flag them.
  const hidden = useMemo(() => {
    if (!range) return [];
    return bookings.filter((b) => {
      const start = new Date(b.start);
      if (start < range.start || start >= range.end) return false;
      const t = therapists.find((x) => x.id === b.therapistId);
      return !t || !isTherapistWorking(t, start);
    });
  }, [range, bookings, therapists]);

  return (
    <>
      <div className="page__header">
        <h1>Schedule</h1>
        <p className="muted">Drag down a therapist&apos;s column to book · drag to move · click to cancel</p>
      </div>

      {hidden.length > 0 && (
        <p className="alert" role="status">
          {hidden.length} booking{hidden.length === 1 ? " is" : "s are"} assigned to a therapist who
          is off: {hidden.map((b) => `${b.client} (${toDateKey(new Date(b.start))})`).join(", ")}.
          Reassign or cancel {hidden.length === 1 ? "it" : "them"}.
        </p>
      )}

      <div className="schedule-layout">
        <div className="card calendar-card">
          <ScheduleCalendar onRangeChange={setRange} />
        </div>
        <TherapistPanel date={day} />
      </div>
    </>
  );
}
