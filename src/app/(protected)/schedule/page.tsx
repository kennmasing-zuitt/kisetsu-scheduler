"use client";

import dynamic from "next/dynamic";
import Loader from "@/components/Loader";

// FullCalendar touches the DOM, so render it on the client only.
const ScheduleCalendar = dynamic(() => import("@/components/ScheduleCalendar"), {
  ssr: false,
  loading: () => <Loader label="Loading calendar…" />,
});

export default function SchedulePage() {
  return (
    <>
      <div className="page__header">
        <h1>Schedule</h1>
        <p className="muted">Drag across hours to add · drag to move · click to delete</p>
      </div>
      <div className="card calendar-card">
        <ScheduleCalendar />
      </div>
    </>
  );
}
