import { formatPeso } from "@/mods/schedule/lib/pricing";
import type { SalesReport } from "@/mods/reports/types";
import SalesChart from "./SalesChart";
import ServiceSalesTable from "./ServiceSalesTable";
import TherapistServiceTable from "./TherapistServiceTable";
import UnpricedBookings from "./UnpricedBookings";
import PromoUsage from "./PromoUsage";
import TopClients from "./TopClients";

/** Headline numbers, the chart, and the tables of one sales report. */
export default function SalesReportView({ report }: { report: SalesReport }) {
    const { totals, clients } = report;
    const hours = totals.minutes / 60;
    const average =
        totals.bookings - totals.unpriced > 0
            ? totals.revenue / (totals.bookings - totals.unpriced)
            : 0;

    return (
        <div className="report">
            <dl className="stat-tiles">
                <div className="card stat">
                    <dt>Revenue</dt>
                    <dd>{formatPeso(totals.revenue)}</dd>
                    {totals.discounts > 0 && (
                        <dd className="stat__sub">
                            {formatPeso(totals.grossRevenue)} − {formatPeso(totals.discounts)}{" "}
                            discounts
                        </dd>
                    )}
                </div>
                <div className="card stat">
                    <dt>Services rendered</dt>
                    <dd>{totals.bookings}</dd>
                    {totals.online > 0 && (
                        <dd className="stat__sub">
                            {totals.online} booked online (
                            {Math.round((totals.online / totals.bookings) * 100)}%)
                        </dd>
                    )}
                </div>
                <div className="card stat">
                    <dt>Clients</dt>
                    <dd>{clients.uniqueClients}</dd>
                    {clients.uniqueClients > 0 && (
                        <dd className="stat__sub">
                            {clients.newClients} new · {clients.returningClients} returning
                        </dd>
                    )}
                </div>
                <div className="card stat">
                    <dt>Hours booked</dt>
                    <dd>{hours.toLocaleString(undefined, { maximumFractionDigits: 1 })}</dd>
                </div>
                <div className="card stat">
                    <dt>Average per service</dt>
                    <dd>{formatPeso(Math.round(average * 100) / 100)}</dd>
                </div>
                {report.cancellations.total > 0 && (
                    <div className="card stat">
                        <dt>Cancelled</dt>
                        <dd>{report.cancellations.total}</dd>
                        <dd className="stat__sub">
                            {report.cancellations.byStaff} by staff ·{" "}
                            {report.cancellations.therapistUnavailable} therapist unavailable
                        </dd>
                    </div>
                )}
                {totals.unpriced > 0 && (
                    <div className="card stat stat--warn">
                        <dt>Without a price</dt>
                        <dd>
                            <a href="#unpriced">{totals.unpriced}</a>
                        </dd>
                    </div>
                )}
            </dl>

            <SalesChart report={report} />
            <TherapistServiceTable report={report} />
            <ServiceSalesTable report={report} />
            <PromoUsage report={report} />
            <TopClients report={report} />
            <UnpricedBookings report={report} />
        </div>
    );
}
