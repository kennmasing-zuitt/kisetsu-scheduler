import { formatPeso } from "@/mods/schedule/lib/pricing";
import type { SalesReport } from "@/mods/reports/types";

/**
 * Sales per service, split by length and by the price that applied. A service whose price
 * changed during the period shows one line per price.
 */
export default function ServiceSalesTable({ report }: { report: SalesReport }) {
    const sold = report.services.filter((s) => s.bookings > 0);

    return (
        <section className="card report-section" aria-labelledby="by-service">
            <h2 id="by-service">Sales by service and price</h2>
            {sold.length === 0 ? (
                <p className="muted">No services rendered in this period.</p>
            ) : (
                <div className="table-wrap">
                    <table className="table table--numbers">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th className="num">Length</th>
                                <th className="num">Price</th>
                                <th className="num">Services</th>
                                <th className="num">Revenue</th>
                            </tr>
                        </thead>
                        {sold.map((s) => (
                            <tbody key={s.serviceId} className="group">
                                {s.lines.map((l, i) => (
                                    <tr key={`${l.durationMin}-${l.unitPrice}`}>
                                        <td>
                                            {i === 0 && s.serviceName}
                                            {i === 0 && !s.isActive && (
                                                <span className="badge"> Archived</span>
                                            )}
                                        </td>
                                        <td className="num">{l.durationMin} min</td>
                                        <td className="num">{formatPeso(l.unitPrice)}</td>
                                        <td className="num">{l.bookings}</td>
                                        <td className="num">{formatPeso(l.revenue)}</td>
                                    </tr>
                                ))}
                                {s.unpriced > 0 && (
                                    <tr>
                                        <td>{s.lines.length === 0 && s.serviceName}</td>
                                        <td className="num muted" colSpan={2}>
                                            no price
                                        </td>
                                        <td className="num">{s.unpriced}</td>
                                        <td className="num muted">—</td>
                                    </tr>
                                )}
                                {s.lines.length + (s.unpriced ? 1 : 0) > 1 && (
                                    <tr className="subtotal">
                                        <td colSpan={3}>{s.serviceName} total</td>
                                        <td className="num">{s.bookings}</td>
                                        <td className="num">{formatPeso(s.revenue)}</td>
                                    </tr>
                                )}
                            </tbody>
                        ))}
                    </table>
                </div>
            )}
        </section>
    );
}
