"use client";

import Link from "next/link";
import ManageTherapists from "@/mods/schedule/components/ManageTherapists";
import ManageRooms from "@/mods/schedule/components/ManageRooms";

export default function ManagePage() {
    return (
        <>
            <div className="page__header">
                <div>
                    <h1>Therapists &amp; rooms</h1>
                    <p className="muted">
                        Add, edit or remove the schedule&apos;s columns and rooms. Days off and
                        leave can also be toggled from the <Link href="/schedule">Schedule</Link>.
                    </p>
                </div>
            </div>

            <div className="manage-grid">
                <ManageTherapists />
                <ManageRooms />
            </div>
        </>
    );
}
