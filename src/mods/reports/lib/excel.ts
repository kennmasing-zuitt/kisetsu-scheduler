import type { Cell, Fill, Row, Workbook, Worksheet } from "exceljs";
import { bucketTitle, rangeLabel } from "@/mods/reports/lib/period";
import type { SalesReport } from "@/mods/reports/types";

/**
 * The sales report as an Excel workbook, built in the browser with ExcelJS from the report
 * already on screen. ExcelJS (~1 MB) is loaded only when someone exports.
 *
 * Sheets: Summary · By therapist (therapist × service counts, requests, gross / discounts /
 * net) · By service & price · By hour / By day / By month · Promos · Top clients · Unpriced
 * (the last three only when there's something to show). Totals are live Excel formulas, so the
 * sheets stay correct if someone edits a number.
 */

const PESO = '"₱"#,##0.00';
const COUNT = '#,##0;-#,##0;"–"'; // zero shows as a dash
const HEADER_FILL: Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F6FED" } };
const TOTAL_FILL: Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F4F7" } };

/**
 * Bold white on the app's primary blue, with a filter on every column. Columns from
 * `numbersFrom` on hold numbers, so their headers align right like the values below.
 */
function styleHeader(sheet: Worksheet, row: Row, numbersFrom = Infinity) {
    row.eachCell((cell, col) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = HEADER_FILL;
        cell.alignment = { vertical: "middle", horizontal: col >= numbersFrom ? "right" : "left" };
    });
    row.height = 20;
    sheet.autoFilter = {
        from: { row: row.number, column: 1 },
        to: { row: row.number, column: row.cellCount },
    };
}

/** Bold on light grey, with a rule above; empty cells in the row are shaded too */
function styleTotal(row: Row) {
    row.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { bold: true };
        cell.fill = TOTAL_FILL;
        cell.border = { top: { style: "thin", color: { argb: "FF98A2B3" } } };
    });
}

/** A formula cell that also carries its computed value (shown before Excel recalculates) */
const formula = (cell: Cell, f: string, result: number) => {
    cell.value = { formula: f, result };
};

const colLetter = (n: number) => {
    let s = "";
    for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
    return s;
};

/** "YYYY-MM-DD" as an Excel date (stored as UTC so no time-zone shift) */
const excelDate = (key: string) => new Date(`${key}T00:00:00Z`);
/** An instant as the wall-clock time the user sees, for an Excel date-time cell */
const excelLocal = (iso: string) => {
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
};

function summarySheet(wb: Workbook, report: SalesReport) {
    const ws = wb.addWorksheet("Summary");
    ws.columns = [{ width: 28 }, { width: 30 }];
    const title = ws.addRow(["Sales report"]);
    title.font = { bold: true, size: 16 };
    ws.addRow([rangeLabel(report)]).font = { size: 12, color: { argb: "FF667085" } };
    ws.addRow([]);

    const info: [string, string | Date | boolean][] = [
        ["Period", report.period],
        ["From", excelDate(report.from)],
        ["To", excelDate(report.to)],
        ["Time zone", report.timeZone],
        ["Currency", report.currency],
        ["Includes upcoming bookings", report.includeUpcoming ? "Yes" : "No"],
        ["Generated", excelLocal(report.generatedAt)],
    ];
    for (const [label, value] of info) {
        const row = ws.addRow([label, value]);
        row.getCell(1).font = { color: { argb: "FF667085" } };
        if (value instanceof Date)
            row.getCell(2).numFmt =
                label === "Generated" ? "mmm d, yyyy h:mm AM/PM" : "mmm d, yyyy";
        row.getCell(2).alignment = { horizontal: "left" };
    }
    ws.addRow([]);

    const { totals } = report;
    const priced = totals.bookings - totals.unpriced;
    const { clients } = report;
    const figures: [string, number, string][] = [
        ["Revenue (net)", totals.revenue, PESO],
        ["Gross (at list prices)", totals.grossRevenue, PESO],
        ["Promo discounts", totals.discounts, PESO],
        ["Services rendered", totals.bookings, "#,##0"],
        ["Requested by name", totals.requested, "#,##0"],
        ["Clients", clients.uniqueClients, "#,##0"],
        ["New clients", clients.newClients, "#,##0"],
        ["Returning clients", clients.returningClients, "#,##0"],
        ["Hours booked", totals.minutes / 60, "#,##0.0"],
        ["Average per service", priced > 0 ? totals.revenue / priced : 0, PESO],
        ["Without a price", totals.unpriced, "#,##0"],
    ];
    for (const [label, value, numFmt] of figures) {
        const row = ws.addRow([label, value]);
        row.getCell(1).font = { bold: true };
        row.getCell(2).numFmt = numFmt;
        row.getCell(2).font = { bold: true, size: 12 };
        row.getCell(2).alignment = { horizontal: "left" };
    }
}

function therapistSheet(wb: Workbook, report: SalesReport) {
    const ws = wb.addWorksheet("By therapist", {
        views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
    });
    const services = report.services;
    const counted = (t: SalesReport["therapists"][number]) =>
        t.services.reduce((sum, c) => sum + c.bookings, 0);
    const hasNoService = report.therapists.some((t) => t.bookings > counted(t));

    const headers = [
        "Therapist",
        ...services.map((s) => s.serviceName),
        ...(hasNoService ? ["No service"] : []),
        "Total",
        "Requested",
        "Request rate",
        "Gross",
        "Discounts",
        "Revenue (net)",
    ];
    ws.columns = headers.map((h, i) => ({ width: i === 0 ? 24 : Math.max(12, h.length + 4) }));
    styleHeader(ws, ws.addRow(headers), 2);

    const countCols = services.length + (hasNoService ? 1 : 0);
    const totalCol = countCols + 2;
    const requestedCol = totalCol + 1;
    const rateCol = totalCol + 2;
    const grossCol = totalCol + 3;
    const discountCol = totalCol + 4;
    const netCol = totalCol + 5;
    const L = colLetter;
    const first = 2;

    for (const t of report.therapists) {
        const counts = services.map(
            (s) => t.services.find((c) => c.serviceId === s.serviceId)?.bookings ?? 0,
        );
        if (hasNoService) counts.push(t.bookings - counted(t));
        const row = ws.addRow([t.therapistName, ...counts]);
        const r = row.number;
        for (let c = 2; c <= countCols + 1; c++) row.getCell(c).numFmt = COUNT;
        formula(row.getCell(totalCol), `SUM(B${r}:${L(countCols + 1)}${r})`, t.bookings);
        row.getCell(totalCol).font = { bold: true };
        row.getCell(requestedCol).value = t.requested;
        row.getCell(requestedCol).numFmt = COUNT;
        formula(
            row.getCell(rateCol),
            `IF(${L(totalCol)}${r}=0,0,${L(requestedCol)}${r}/${L(totalCol)}${r})`,
            t.requestRate,
        );
        row.getCell(rateCol).numFmt = "0%";
        row.getCell(grossCol).value = t.grossRevenue;
        row.getCell(discountCol).value = t.discounts;
        formula(row.getCell(netCol), `${L(grossCol)}${r}-${L(discountCol)}${r}`, t.revenue);
        for (const c of [grossCol, discountCol, netCol]) row.getCell(c).numFmt = PESO;
    }

    const last = ws.rowCount;
    const total = ws.addRow(["Total"]);
    const sumOf = (c: number) =>
        report.therapists
            .map((_, i) => ws.getRow(first + i).getCell(c).value)
            .reduce<number>((sum, v) => sum + (typeof v === "number" ? v : 0), 0);
    for (let c = 2; c <= netCol; c++) {
        if (c === rateCol) {
            formula(
                total.getCell(c),
                `IF(${L(totalCol)}${total.number}=0,0,${L(requestedCol)}${total.number}/${L(totalCol)}${total.number})`,
                report.totals.bookings ? report.totals.requested / report.totals.bookings : 0,
            );
            total.getCell(c).numFmt = "0%";
            continue;
        }
        const result =
            c === totalCol
                ? report.totals.bookings
                : c === grossCol
                  ? report.totals.grossRevenue
                  : c === discountCol
                    ? report.totals.discounts
                    : c === netCol
                      ? report.totals.revenue
                      : sumOf(c);
        formula(total.getCell(c), `SUM(${L(c)}${first}:${L(c)}${last})`, result);
        total.getCell(c).numFmt = c >= grossCol ? PESO : COUNT;
    }
    styleTotal(total);
}

function serviceSheet(wb: Workbook, report: SalesReport) {
    const ws = wb.addWorksheet("By service & price", { views: [{ state: "frozen", ySplit: 1 }] });
    ws.columns = [
        { width: 22 },
        { width: 14 },
        { width: 14 },
        { width: 12 },
        { width: 16 },
        { width: 14 },
        { width: 16 },
    ];
    styleHeader(
        ws,
        ws.addRow([
            "Service",
            "Length (min)",
            "Unit price",
            "Services",
            "Gross",
            "Discounts",
            "Net",
        ]),
        2,
    );

    // Gross = price × services, net = gross − discounts; per-service and grand totals use
    // SUBTOTAL so the grand total skips the per-service subtotals
    for (const s of report.services.filter((x) => x.bookings > 0)) {
        const start = ws.rowCount + 1;
        for (const l of s.lines) {
            const row = ws.addRow([s.serviceName, l.durationMin, l.unitPrice, l.bookings]);
            const r = row.number;
            formula(row.getCell(5), `C${r}*D${r}`, l.grossRevenue);
            row.getCell(6).value = l.discounts;
            formula(row.getCell(7), `E${r}-F${r}`, l.revenue);
            for (const c of [3, 5, 6, 7]) row.getCell(c).numFmt = PESO;
        }
        if (s.unpriced > 0) {
            const row = ws.addRow([s.serviceName, "no price", null, s.unpriced, 0, 0, 0]);
            row.getCell(2).font = { italic: true, color: { argb: "FFB42318" } };
            for (const c of [5, 6, 7]) row.getCell(c).numFmt = PESO;
        }
        const end = ws.rowCount;
        const sub = ws.addRow([`${s.serviceName} total`]);
        formula(sub.getCell(4), `SUBTOTAL(9,D${start}:D${end})`, s.bookings);
        formula(sub.getCell(5), `SUBTOTAL(9,E${start}:E${end})`, s.grossRevenue);
        formula(sub.getCell(6), `SUBTOTAL(9,F${start}:F${end})`, s.discounts);
        formula(sub.getCell(7), `SUBTOTAL(9,G${start}:G${end})`, s.revenue);
        for (const c of [5, 6, 7]) sub.getCell(c).numFmt = PESO;
        styleTotal(sub);
    }

    const end = ws.rowCount;
    const grand = ws.addRow(["Grand total"]);
    const rendered = report.services.reduce((sum, s) => sum + s.bookings, 0);
    formula(grand.getCell(4), `SUBTOTAL(9,D2:D${end})`, rendered);
    formula(grand.getCell(5), `SUBTOTAL(9,E2:E${end})`, report.totals.grossRevenue);
    formula(grand.getCell(6), `SUBTOTAL(9,F2:F${end})`, report.totals.discounts);
    formula(grand.getCell(7), `SUBTOTAL(9,G2:G${end})`, report.totals.revenue);
    for (const c of [5, 6, 7]) grand.getCell(c).numFmt = PESO;
    styleTotal(grand);
    grand.font = { bold: true, size: 12 };
}

function promoSheet(wb: Workbook, report: SalesReport) {
    if (report.promos.length === 0) return;
    const ws = wb.addWorksheet("Promos", { views: [{ state: "frozen", ySplit: 1 }] });
    ws.columns = [{ width: 20 }, { width: 12 }, { width: 18 }];
    styleHeader(ws, ws.addRow(["Code", "Bookings", "Discounts given"]), 2);
    for (const p of report.promos) {
        const row = ws.addRow([p.code, p.bookings, p.discounts]);
        row.getCell(3).numFmt = PESO;
    }
    const end = ws.rowCount;
    const total = ws.addRow(["Total"]);
    formula(
        total.getCell(2),
        `SUM(B2:B${end})`,
        report.promos.reduce((n, p) => n + p.bookings, 0),
    );
    formula(total.getCell(3), `SUM(C2:C${end})`, report.totals.discounts);
    total.getCell(3).numFmt = PESO;
    styleTotal(total);
}

function clientSheet(wb: Workbook, report: SalesReport) {
    const { clients } = report;
    if (clients.uniqueClients === 0) return;
    const ws = wb.addWorksheet("Top clients", { views: [{ state: "frozen", ySplit: 1 }] });
    ws.columns = [{ width: 24 }, { width: 18 }, { width: 12 }, { width: 16 }, { width: 18 }];
    styleHeader(
        ws,
        ws.addRow(["Client", "Mobile", "Bookings", "Revenue (net)", "Visits (all time)"]),
        3,
    );
    for (const c of clients.top) {
        const row = ws.addRow([c.name, c.mobile, c.bookings, c.revenue, c.totalVisits]);
        row.getCell(4).numFmt = PESO;
    }
    ws.addRow([]);
    ws.addRow([
        `${clients.uniqueClients} clients in the period: ${clients.newClients} new, ` +
            `${clients.returningClients} returning` +
            (clients.noClient ? `; ${clients.noClient} bookings without a client` : ""),
    ]).font = { italic: true, color: { argb: "FF667085" } };
}

function seriesSheet(wb: Workbook, report: SalesReport) {
    const { period } = report;
    const ws = wb.addWorksheet(
        period === "daily" ? "By hour" : period === "annual" ? "By month" : "By day",
        { views: [{ state: "frozen", ySplit: 1 }] },
    );
    ws.columns = [{ width: 22 }, { width: 12 }, { width: 16 }];
    const first = period === "daily" ? "Hour" : period === "annual" ? "Month" : "Date";
    styleHeader(ws, ws.addRow([first, "Services", "Revenue"]), 2);
    for (const b of report.series) {
        // Hours as text ("3 PM – 4 PM"); days and months as real Excel dates
        const label =
            period === "daily"
                ? bucketTitle(b.key, period)
                : excelDate(period === "annual" ? `${b.key}-01` : b.key);
        const row = ws.addRow([label, b.bookings, b.revenue]);
        if (period !== "daily")
            row.getCell(1).numFmt = period === "annual" ? "mmmm yyyy" : "ddd, mmm d, yyyy";
        row.getCell(2).numFmt = COUNT;
        row.getCell(3).numFmt = PESO;
    }
    const end = ws.rowCount;
    const total = ws.addRow(["Total"]);
    // Daily totals include bookings outside opening hours, which have no hour row
    const inChart = report.series.reduce((sum, b) => sum + b.bookings, 0);
    const chartRevenue = report.series.reduce((sum, b) => sum + b.revenue, 0);
    formula(total.getCell(2), `SUM(B2:B${end})`, inChart);
    formula(total.getCell(3), `SUM(C2:C${end})`, chartRevenue);
    total.getCell(3).numFmt = PESO;
    styleTotal(total);
}

function unpricedSheet(wb: Workbook, report: SalesReport) {
    if (report.unpriced.length === 0) return;
    const ws = wb.addWorksheet("Unpriced", { views: [{ state: "frozen", ySplit: 1 }] });
    ws.columns = [
        { width: 22 },
        { width: 22 },
        { width: 18 },
        { width: 16 },
        { width: 10 },
        { width: 34 },
    ];
    styleHeader(ws, ws.addRow(["Start", "Client", "Therapist", "Service", "Minutes", "Reason"]));
    for (const u of report.unpriced) {
        const row = ws.addRow([
            excelLocal(u.start),
            u.client,
            u.therapistName,
            u.serviceName ?? "—",
            u.durationMin,
            u.reason === "noService"
                ? "Booking has no service"
                : `No ${u.durationMin}-minute price on that date`,
        ]);
        row.getCell(1).numFmt = "mmm d, yyyy h:mm AM/PM";
    }
}

/** Builds the workbook (loads ExcelJS on first use). */
export async function buildSalesWorkbook(report: SalesReport): Promise<Workbook> {
    const ExcelJS = await import("exceljs");
    // The browser bundle is CommonJS: Workbook may sit on the module or on its default export
    const WorkbookClass =
        ExcelJS.Workbook ?? (ExcelJS as unknown as { default: typeof ExcelJS }).default.Workbook;
    const wb = new WorkbookClass();
    wb.creator = "Kisetsu Scheduler";
    wb.created = new Date();
    wb.title = `Sales report ${rangeLabel(report)}`;
    // Have Excel recompute every formula on open, so cached results never go stale or blank
    wb.calcProperties.fullCalcOnLoad = true;

    summarySheet(wb, report);
    therapistSheet(wb, report);
    serviceSheet(wb, report);
    seriesSheet(wb, report);
    promoSheet(wb, report);
    clientSheet(wb, report);
    unpricedSheet(wb, report);

    // Print landscape, one page wide; table sheets repeat their header row on every page
    for (const ws of wb.worksheets) {
        Object.assign(ws.pageSetup, {
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            ...(ws.name === "Summary" ? {} : { printTitlesRow: "1:1" }),
        });
    }
    return wb;
}

/** Saves the report as sales-<period>-<from>.xlsx */
export async function downloadSalesReportExcel(report: SalesReport) {
    const wb = await buildSalesWorkbook(report);
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-${report.period}-${report.from}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
}
