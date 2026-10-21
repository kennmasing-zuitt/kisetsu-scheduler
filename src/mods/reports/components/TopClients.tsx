import { formatPeso } from "@/mods/schedule/lib/pricing";
import { formatMobile } from "@/mods/clients/lib/mobile";
import type { SalesReport } from "@/mods/reports/types";

/** New vs returning clients in the period, and the clients who booked most. */
export default function TopClients({ report }: { report: SalesReport }) {
    const { clients } = report;
    if (clients.uniqueClients === 0 && clients.noClient === 0) return null;
    return (
        <section className="card report-section" aria-labelledby="clients">
            <h2 id="clients">Clients</h2>
            <p className="muted small">
                {clients.uniqueClients} client{clients.uniqueClients === 1 ? "" : "s"} ·{" "}
                {clients.newClients} new · {clients.returningClients} returning
                {clients.noClient > 0 &&
                    ` · ${clients.noClient} booking${clients.noClient === 1 ? "" : "s"} without a client (made before mobiles were required)`}
            </p>
            {clients.top.length > 0 && (
                <div className="table-wrap">
                    <table className="table table--numbers">
                        <thead>
                            <tr>
                                <th>Top clients</th>
                                <th>Mobile</th>
                                <th className="num">Bookings</th>
                                <th className="num">Revenue</th>
                                <th className="num">Visits (all time)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.top.map((c) => (
                                <tr key={c.clientId}>
                                    <td>{c.name}</td>
                                    <td>{formatMobile(c.mobile)}</td>
                                    <td className="num">{c.bookings}</td>
                                    <td className="num">{formatPeso(c.revenue)}</td>
                                    <td className="num">{c.totalVisits}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
