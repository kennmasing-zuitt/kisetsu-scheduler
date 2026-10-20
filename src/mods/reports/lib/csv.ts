import { rangeLabel } from "@/mods/reports/lib/period";
import type { SalesReport } from "@/mods/reports/types";

const cell = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const row = (...values: (string | number | null | undefined)[]) => values.map(cell).join(",");

/** The report as CSV (opens in Excel / Google Sheets): summary, therapist × service, prices. */
export function salesReportCsv(report: SalesReport): string {
    const services = report.services;
    const lines: string[] = [
        row("Sales report", rangeLabel(report)),
        row("Period", report.period, "From", report.from, "To", report.to),
        row("Currency", report.currency, "Time zone", report.timeZone),
        row("Includes upcoming bookings", report.includeUpcoming ? "yes" : "no"),
        row("Generated", new Date(report.generatedAt).toLocaleString()),
        "",
        row("Services rendered", report.totals.bookings),
        row("Revenue", report.totals.revenue),
        row("Unpriced bookings", report.totals.unpriced),
        "",
        row("Therapist", ...services.map((s) => s.serviceName), "No service", "Total", "Revenue"),
    ];
    for (const t of report.therapists) {
        const counts = services.map(
            (s) => t.services.find((c) => c.serviceId === s.serviceId)?.bookings ?? 0,
        );
        const noService = t.bookings - counts.reduce((a, b) => a + b, 0);
        lines.push(row(t.therapistName, ...counts, noService, t.bookings, t.revenue));
    }
    lines.push(
        "",
        row("Service", "Length (min)", "Unit price", "Bookings", "Revenue"),
        ...services.flatMap((s) =>
            s.lines.map((l) =>
                row(s.serviceName, l.durationMin, l.unitPrice, l.bookings, l.revenue),
            ),
        ),
    );
    if (report.unpriced.length) {
        lines.push(
            "",
            row("Unpriced booking", "Start", "Therapist", "Service", "Minutes", "Reason"),
            ...report.unpriced.map((u) =>
                row(
                    u.client,
                    new Date(u.start).toLocaleString(),
                    u.therapistName,
                    u.serviceName,
                    u.durationMin,
                    u.reason === "noService" ? "No service" : "No price for that date/length",
                ),
            ),
        );
    }
    return lines.join("\r\n");
}

/** Saves the report as sales-<period>-<from>.csv */
export function downloadSalesReportCsv(report: SalesReport) {
    // BOM so Excel reads ₱ and accents as UTF-8
    const blob = new Blob(["﻿", salesReportCsv(report)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-${report.period}-${report.from}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
