import { formatPeso } from "@/mods/schedule/lib/pricing";
import type { SalesReport } from "@/mods/reports/types";

/** Promo codes used in the period and how much each gave away. */
export default function PromoUsage({ report }: { report: SalesReport }) {
    if (report.promos.length === 0) return null;
    return (
        <section className="card report-section" aria-labelledby="promos">
            <h2 id="promos">Promo codes used</h2>
            <div className="table-wrap">
                <table className="table table--numbers">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th className="num">Bookings</th>
                            <th className="num">Discounts given</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.promos.map((p) => (
                            <tr key={p.promoId}>
                                <td>
                                    <strong>{p.code}</strong>
                                </td>
                                <td className="num">{p.bookings}</td>
                                <td className="num">{formatPeso(p.discounts)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Total</th>
                            <td className="num strong">
                                {report.promos.reduce((sum, p) => sum + p.bookings, 0)}
                            </td>
                            <td className="num strong">{formatPeso(report.totals.discounts)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
}
