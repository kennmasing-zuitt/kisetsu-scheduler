"use client";

import { formatPeso } from "@/mods/schedule/lib/pricing";
import { bucketLabel, bucketTitle, bucketUnit, showAxisLabel } from "@/mods/reports/lib/period";
import type { SalesReport } from "@/mods/reports/types";

const compactPeso = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
});

/** Round up to a readable axis maximum: 1, 2, 4, 5 or 8 × 10^n */
function niceCeil(x: number): number {
    if (x <= 0) return 0;
    const p = 10 ** Math.floor(Math.log10(x));
    return ([1, 2, 4, 5, 8, 10].find((m) => m * p >= x) ?? 10) * p;
}

/**
 * Revenue per hour (daily), day (weekly, monthly) or month (annual) as a single-series bar chart.
 * One hue, thin bars rounded at the top, recessive grid; hover or focus a bar for its numbers.
 * The tables below the chart carry the same data as text.
 */
export default function SalesChart({ report }: { report: SalesReport }) {
    const { series, period } = report;
    const top = niceCeil(Math.max(0, ...series.map((b) => b.revenue))) || 1000;
    const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => top * f);
    const empty = series.every((b) => b.bookings === 0);

    return (
        <figure className="card chart">
            <figcaption className="chart__title">Revenue by {bucketUnit(period)}</figcaption>
            <div className="chart__plot">
                <div className="chart__area">
                    {ticks.map((t) => (
                        <div
                            key={t}
                            className="chart__gridline"
                            style={{ bottom: `${(t / top) * 100}%` }}
                            aria-hidden
                        >
                            <span>{compactPeso.format(t)}</span>
                        </div>
                    ))}

                    <ol className="chart__bars">
                        {series.map((b, i) => {
                            const title = bucketTitle(b.key, period);
                            const height = (b.revenue / top) * 100;
                            const summary = `${formatPeso(b.revenue)} · ${b.bookings} service${b.bookings === 1 ? "" : "s"}`;
                            return (
                                <li
                                    key={b.key}
                                    className="chart__col"
                                    tabIndex={0}
                                    aria-label={`${title}: ${summary}`}
                                >
                                    {b.revenue > 0 && (
                                        <span
                                            className="chart__bar"
                                            style={{ height: `${height}%` }}
                                        />
                                    )}
                                    <span
                                        className={
                                            i < series.length / 2
                                                ? "chart__tip"
                                                : "chart__tip chart__tip--end"
                                        }
                                        style={{ bottom: `calc(${height}% + 8px)` }}
                                        role="tooltip"
                                    >
                                        <strong>{title}</strong>
                                        <br />
                                        {summary}
                                    </span>
                                    {showAxisLabel(period, i) && (
                                        <span className="chart__x" aria-hidden>
                                            {(() => {
                                                const [prefix, main] = bucketLabel(b.key, period);
                                                return (
                                                    <>
                                                        {prefix && (
                                                            <span className="chart__x-prefix">
                                                                {prefix}{" "}
                                                            </span>
                                                        )}
                                                        {main}
                                                    </>
                                                );
                                            })()}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ol>

                    {empty && (
                        <p className="chart__empty muted">No services rendered in this period</p>
                    )}
                </div>
            </div>
        </figure>
    );
}
