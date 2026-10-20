"use client";

import { useState } from "react";
import Loader from "@/components/ui/Loader";
import { usePermissions } from "@/mods/auth/usePermissions";
import { useGetSalesReportQuery } from "@/mods/reports/reportsApi";
import { PERIODS, rangeLabel, shiftDate } from "@/mods/reports/lib/period";
import { downloadSalesReportExcel } from "@/mods/reports/lib/excel";
import SalesReportView from "@/mods/reports/components/SalesReportView";
import { toDateKey } from "@/mods/schedule/lib/availability";
import type { ReportPeriod } from "@/mods/reports/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

export default function ReportsPage() {
    const { can, isLoading: permsLoading } = usePermissions();
    const allowed = can("readReports");

    const [period, setPeriod] = useState<ReportPeriod>("weekly");
    const [date, setDate] = useState(() => toDateKey(new Date()));
    const [includeUpcoming, setIncludeUpcoming] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const {
        data: report,
        isFetching,
        isLoading,
        error,
    } = useGetSalesReportQuery(
        { period, date, includeUpcoming },
        // Refresh a report older than a minute when it's shown again
        { skip: !allowed, refetchOnMountOrArgChange: 60 },
    );

    async function exportExcel() {
        if (!report || exporting) return;
        setExporting(true);
        setExportError(null);
        try {
            await downloadSalesReportExcel(report);
        } catch (err) {
            setExportError(err instanceof Error ? err.message : "Couldn't create the Excel file");
        } finally {
            setExporting(false);
        }
    }

    if (permsLoading) return <Loader label="Checking your access…" />;

    return (
        <>
            <div className="page__header">
                <div>
                    <h1>Sales reports</h1>
                    <p className="muted">
                        Services rendered and revenue, each booking at the price in effect on its
                        date.
                    </p>
                </div>
                {report && (
                    <div className="row-actions no-print">
                        <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={exportExcel}
                            disabled={exporting}
                        >
                            {exporting ? "Preparing…" : "Download Excel"}
                        </button>
                        <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={() => window.print()}
                        >
                            Print
                        </button>
                    </div>
                )}
            </div>

            {!allowed ? (
                <p className="alert" role="alert">
                    Your account can&apos;t view reports. Ask an admin for the{" "}
                    <code>readReports</code> permission.
                </p>
            ) : (
                <>
                    <div className="card report-controls no-print">
                        <div className="segmented" role="group" aria-label="Report period">
                            {PERIODS.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    aria-pressed={period === p.value}
                                    className={period === p.value ? "is-active" : undefined}
                                    onClick={() => setPeriod(p.value)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="report-controls__nav">
                            <button
                                type="button"
                                className="icon-btn"
                                aria-label="Previous"
                                onClick={() => setDate(shiftDate(period, date, -1))}
                            >
                                ‹
                            </button>
                            <strong className="report-controls__label">
                                {report ? rangeLabel(report) : "…"}
                            </strong>
                            <button
                                type="button"
                                className="icon-btn"
                                aria-label="Next"
                                onClick={() => setDate(shiftDate(period, date, 1))}
                            >
                                ›
                            </button>
                        </div>

                        <div className="report-controls__end">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => e.target.value && setDate(e.target.value)}
                                aria-label="Any day in the period"
                            />
                            <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={() => setDate(toDateKey(new Date()))}
                            >
                                Today
                            </button>
                            <label className="check small">
                                <input
                                    type="checkbox"
                                    checked={includeUpcoming}
                                    onChange={(e) => setIncludeUpcoming(e.target.checked)}
                                />
                                Include upcoming bookings
                            </label>
                        </div>
                    </div>

                    {report && <h2 className="print-only">{rangeLabel(report)}</h2>}
                    {error && <p className="alert">{(error as GraphqlError).message}</p>}
                    {exportError && (
                        <p className="alert" role="alert">
                            {exportError}
                        </p>
                    )}
                    {isLoading && <Loader label="Building report…" />}
                    {report && (
                        <div className={isFetching ? "is-refreshing" : undefined}>
                            <SalesReportView report={report} />
                        </div>
                    )}
                </>
            )}
        </>
    );
}
