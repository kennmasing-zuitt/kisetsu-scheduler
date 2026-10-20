"use client";

import Link from "next/link";
import ManageTherapists from "@/mods/schedule/components/ManageTherapists";
import ManageRooms from "@/mods/schedule/components/ManageRooms";
import ManageServices from "@/mods/schedule/components/ManageServices";

export default function ManagePage() {
    return (
        <>
            <div className="page__header">
                <div>
                    <h1>Therapists, rooms &amp; services</h1>
                    <p className="muted">
                        Add, edit or remove therapists, rooms and the services you sell, with their
                        prices. Days off and leave can also be toggled from the{" "}
                        <Link href="/schedule">Schedule</Link>.
                    </p>
                </div>
            </div>

            <div className="manage-grid">
                <ManageTherapists />
                <ManageRooms />
            </div>
            <div className="manage-grid manage-grid--full">
                <ManageServices />
            </div>
        </>
    );
}
