"use client";

import Link from "next/link";
import ManageTherapists from "@/mods/schedule/components/ManageTherapists";
import ManageRooms from "@/mods/schedule/components/ManageRooms";
import ManageServices from "@/mods/schedule/components/ManageServices";
import ManagePromos from "@/mods/schedule/components/ManagePromos";
import SmsLogPanel from "@/mods/sms/components/SmsLogPanel";

export default function ManagePage() {
    return (
        <>
            <div className="page__header">
                <div>
                    <h1>Therapists, rooms, services &amp; promos</h1>
                    <p className="muted">
                        Add, edit or remove therapists, rooms, the services you sell (with their
                        prices) and promo codes. Days off and leave can also be toggled from the{" "}
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
                <ManagePromos />
                <SmsLogPanel />
            </div>
        </>
    );
}
