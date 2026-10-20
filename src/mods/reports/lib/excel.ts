import type { Cell, Fill, Row, Workbook, Worksheet } from "exceljs";
import { rangeLabel } from "@/mods/reports/lib/period";
import type { SalesReport } from "@/mods/reports/types";

/**
 * The sales report as an Excel workbook, built in the browser with ExcelJS from the report
 * already on screen. ExcelJS (~1 MB) is loaded only when someone exports.
 *
 * Sheets: Summary · By therapist (therapist × service counts) · By service & price ·
 * By day / By month · Unpriced (when there are any). Totals are live Excel formulas, so the
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
    const figures: [string, number, string][] = [
        ["Revenue", totals.revenue, PESO],
        ["Services rendered", totals.bookings, "#,##0"],
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
        "Revenue",
    ];
    ws.columns = headers.map((h, i) => ({ width: i === 0 ? 24 : Math.max(12, h.length + 4) }));
    styleHeader(ws, ws.addRow(headers), 2);

    const countCols = services.length + (hasNoService ? 1 : 0);
    const totalCol = countCols + 2;
    const revenueCol = countCols + 3;
    const first = 2;

    for (const t of report.therapists) {
        const counts = services.map(
            (s) => t.services.find((c) => c.serviceId === s.serviceId)?.bookings ?? 0,
        );
        if (hasNoService) counts.push(t.bookings - counted(t));
        const row = ws.addRow([t.therapistName, ...counts]);
        for (let c = 2; c <= countCols + 1; c++) row.getCell(c).numFmt = COUNT;
        formula(
            row.getCell(totalCol),
            `SUM(B${row.number}:${colLetter(countCols + 1)}${row.number})`,
            t.bookings,
        );
        row.getCell(totalCol).font = { bold: true };
        row.getCell(revenueCol).value = t.revenue;
        row.getCell(revenueCol).numFmt = PESO;
    }

    const last = ws.rowCount;
    const total = ws.addRow(["Total"]);
    for (let c = 2; c <= revenueCol; c++) {
        const col = colLetter(c);
        const values = report.therapists.map((_, i) => ws.getRow(first + i).getCell(c).value);
        const result =
            c === revenueCol
                ? report.totals.revenue
                : c === totalCol
                  ? report.totals.bookings
                  : values.reduce<number>((sum, v) => sum + (typeof v === "number" ? v : 0), 0);
        formula(total.getCell(c), `SUM(${col}${first}:${col}${last})`, result);
        total.getCell(c).numFmt = c === revenueCol ? PESO : COUNT;
    }
    styleTotal(total);
}

function serviceSheet(wb: Workbook, report: SalesReport) {
    const ws = wb.addWorksheet("By service & price", { views: [{ state: "frozen", ySplit: 1 }] });
    ws.columns = [{ width: 22 }, { width: 14 }, { width: 14 }, { width: 12 }, { width: 16 }];
    styleHeader(ws, ws.addRow(["Service", "Length (min)", "Unit price", "Services", "Revenue"]), 2);

    // Line revenue = price × services; per-service and grand totals use SUBTOTAL so the grand
    // total skips the per-service subtotals
    for (const s of report.services.filter((x) => x.bookings > 0)) {
        const start = ws.rowCount + 1;
        for (const l of s.lines) {
            const row = ws.addRow([s.serviceName, l.durationMin, l.unitPrice, l.bookings]);
            row.getCell(3).numFmt = PESO;
            formula(row.getCell(5), `C${row.number}*D${row.number}`, l.revenue);
            row.getCell(5).numFmt = PESO;
        }
        if (s.unpriced > 0) {
            const row = ws.addRow([s.serviceName, "no price", null, s.unpriced, 0]);
            row.getCell(2).font = { italic: true, color: { argb: "FFB42318" } };
            row.getCell(5).numFmt = PESO;
        }
        const end = ws.rowCount;
        const sub = ws.addRow([`${s.serviceName} total`]);
        formula(sub.getCell(4), `SUBTOTAL(9,D${start}:D${end})`, s.bookings);
        formula(sub.getCell(5), `SUBTOTAL(9,E${start}:E${end})`, s.revenue);
        sub.getCell(5).numFmt = PESO;
        styleTotal(sub);
    }

    const end = ws.rowCount;
    const grand = ws.addRow(["Grand total"]);
    const priced = report.services.reduce((sum, s) => sum + s.bookings, 0);
    formula(grand.getCell(4), `SUBTOTAL(9,D2:D${end})`, priced);
    formula(grand.getCell(5), `SUBTOTAL(9,E2:E${end})`, report.totals.revenue);
    grand.getCell(5).numFmt = PESO;
    styleTotal(grand);
    grand.font = { bold: true, size: 12 };
}

function seriesSheet(wb: Workbook, report: SalesReport) {
    const annual = report.period === "annual";
    const ws = wb.addWorksheet(annual ? "By month" : "By day", {
        views: [{ state: "frozen", ySplit: 1 }],
    });
    ws.columns = [{ width: 22 }, { width: 12 }, { width: 16 }];
    styleHeader(ws, ws.addRow([annual ? "Month" : "Date", "Services", "Revenue"]), 2);
    for (const b of report.series) {
        const row = ws.addRow([excelDate(annual ? `${b.key}-01` : b.key), b.bookings, b.revenue]);
        row.getCell(1).numFmt = annual ? "mmmm yyyy" : "ddd, mmm d, yyyy";
        row.getCell(2).numFmt = COUNT;
        row.getCell(3).numFmt = PESO;
    }
    const end = ws.rowCount;
    const total = ws.addRow(["Total"]);
    formula(total.getCell(2), `SUM(B2:B${end})`, report.totals.bookings);
    formula(total.getCell(3), `SUM(C2:C${end})`, report.totals.revenue);
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

    summarySheet(wb, report);
    therapistSheet(wb, report);
    serviceSheet(wb, report);
    seriesSheet(wb, report);
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
