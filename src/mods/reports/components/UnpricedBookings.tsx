import Link from "next/link";
import type { SalesReport } from "@/mods/reports/types";

/** Bookings that added no revenue, and why, so the prices or bookings can be fixed. */
export default function UnpricedBookings({ report }: { report: SalesReport }) {
    if (report.unpriced.length === 0) return null;

    return (
        <section className="card report-section report-section--warn" aria-labelledby="unpriced">
            <h2 id="unpriced">Bookings without a price ({report.unpriced.length})</h2>
            <p className="muted small">
                These count as services rendered but add nothing to revenue. Add the missing price
                period on <Link href="/manage">Therapists, rooms &amp; services</Link> (reports
                re-price automatically), or give the booking a service.
            </p>
            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>When</th>
                            <th>Client</th>
                            <th>Therapist</th>
                            <th>Service</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.unpriced.map((u) => (
                            <tr key={u.bookingId}>
                                <td>
                                    {new Date(u.start).toLocaleString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </td>
                                <td>{u.client}</td>
                                <td>{u.therapistName}</td>
                                <td>{u.serviceName ?? "—"}</td>
                                <td>
                                    {u.reason === "noService"
                                        ? "Booking has no service"
                                        : `No ${u.durationMin}-minute price on that date`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
