import type { ReportPeriod, SalesReport } from "@/mods/reports/types";

export const PERIODS: { value: ReportPeriod; label: string }[] = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "annual", label: "Annual" },
];

/** Local date for a "YYYY-MM-DD" key (midnight, browser time zone) */
const toDate = (key: string) => new Date(`${key}T00:00:00`);

const keyOf = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The same kind of period, one step earlier (-1) or later (+1). */
export function shiftDate(period: ReportPeriod, dateKey: string, step: 1 | -1): string {
    const d = toDate(dateKey);
    if (period === "weekly") d.setDate(d.getDate() + 7 * step);
    else if (period === "monthly") d.setMonth(d.getMonth() + step, 1);
    else d.setFullYear(d.getFullYear() + step, 0, 1);
    return keyOf(d);
}

const dayFmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

/** "Dec 29, 2025 – Jan 4, 2026", "January 2026" or "2026" */
export function rangeLabel(report: Pick<SalesReport, "period" | "from" | "to">): string {
    const from = toDate(report.from);
    if (report.period === "annual") return String(from.getFullYear());
    if (report.period === "monthly")
        return from.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    return `${from.toLocaleDateString(undefined, dayFmt)} – ${toDate(report.to).toLocaleDateString(undefined, dayFmt)}`;
}

/**
 * Short axis label as [prefix, main]: ["Mon", "29"], ["", "5"] or ["", "Jan"].
 * The prefix (weekday) is dropped on narrow screens so seven labels still fit.
 */
export function bucketLabel(key: string, period: ReportPeriod): [string, string] {
    if (period === "annual")
        return ["", toDate(`${key}-01`).toLocaleDateString(undefined, { month: "short" })];
    const d = toDate(key);
    if (period === "monthly") return ["", String(d.getDate())];
    return [d.toLocaleDateString(undefined, { weekday: "short" }), String(d.getDate())];
}

/** Full label for tooltips: "Mon, Dec 29, 2025" or "January 2026" */
export function bucketTitle(key: string, period: ReportPeriod): string {
    if (period === "annual")
        return toDate(`${key}-01`).toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
        });
    return toDate(key).toLocaleDateString(undefined, { weekday: "short", ...dayFmt });
}

/** Which axis labels to print: every bar for weeks and years; 1, 5, 10, … for months. */
export const showAxisLabel = (period: ReportPeriod, index: number) =>
    period !== "monthly" || index === 0 || (index + 1) % 5 === 0;
