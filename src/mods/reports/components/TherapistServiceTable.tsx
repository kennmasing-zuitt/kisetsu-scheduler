import { formatPeso } from "@/mods/schedule/lib/pricing";
import type { SalesReport } from "@/mods/reports/types";

/**
 * Services rendered by each therapist: one row per therapist, one column per service
 * (count of bookings), then the total, how many were requested by name (and the share), and
 * the net revenue. Hover a count for its revenue, or a revenue for its gross and discounts.
 */
export default function TherapistServiceTable({ report }: { report: SalesReport }) {
    const { therapists, services, totals } = report;

    const counted = (t: SalesReport["therapists"][number]) =>
        t.services.reduce((sum, c) => sum + c.bookings, 0);
    const noServiceTotal = therapists.reduce((sum, t) => sum + t.bookings - counted(t), 0);

    return (
        <section className="card report-section" aria-labelledby="by-therapist">
            <h2 id="by-therapist">Services rendered by therapist</h2>
            <div className="table-wrap">
                <table className="table table--numbers">
                    <thead>
                        <tr>
                            <th>Therapist</th>
                            {services.map((s) => (
                                <th key={s.serviceId} className="num">
                                    {s.serviceName}
                                </th>
                            ))}
                            {noServiceTotal > 0 && <th className="num">No service</th>}
                            <th className="num">Total</th>
                            <th
                                className="num"
                                title="Bookings where the client asked for this therapist by name"
                            >
                                Requested
                            </th>
                            <th className="num">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {therapists.map((t) => {
                            const noService = t.bookings - counted(t);
                            return (
                                <tr key={t.therapistId}>
                                    <td>{t.therapistName}</td>
                                    {services.map((s) => {
                                        const c = t.services.find(
                                            (x) => x.serviceId === s.serviceId,
                                        );
                                        return (
                                            <td
                                                key={s.serviceId}
                                                className={c ? "num" : "num muted"}
                                                title={c ? `${formatPeso(c.revenue)}` : undefined}
                                            >
                                                {c ? c.bookings : "—"}
                                            </td>
                                        );
                                    })}
                                    {noServiceTotal > 0 && (
                                        <td className={noService ? "num" : "num muted"}>
                                            {noService || "—"}
                                        </td>
                                    )}
                                    <td className="num strong">{t.bookings}</td>
                                    <td className={t.requested ? "num" : "num muted"}>
                                        {t.requested
                                            ? `${t.requested} (${Math.round(t.requestRate * 100)}%)`
                                            : "—"}
                                    </td>
                                    <td
                                        className="num"
                                        title={
                                            t.discounts
                                                ? `${formatPeso(t.grossRevenue)} − ${formatPeso(t.discounts)} discounts`
                                                : undefined
                                        }
                                    >
                                        {formatPeso(t.revenue)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Total</th>
                            {services.map((s) => (
                                <td key={s.serviceId} className="num strong">
                                    {s.bookings}
                                </td>
                            ))}
                            {noServiceTotal > 0 && <td className="num strong">{noServiceTotal}</td>}
                            <td className="num strong">{totals.bookings}</td>
                            <td className="num strong">
                                {totals.requested
                                    ? `${totals.requested} (${Math.round((totals.requested / totals.bookings) * 100)}%)`
                                    : "—"}
                            </td>
                            <td className="num strong">{formatPeso(totals.revenue)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
}
