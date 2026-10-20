/**
 * App-facing report types, derived from the codegen output in src/gql.
 * Don't hand-edit shapes here: change mods/reports/graphql/reports.graphql and run `npm run codegen`.
 */
import type { SalesReportQuery } from "@/gql/graphql";

export type { ReportPeriod, UnpricedReason } from "@/gql/graphql";

export type SalesReport = SalesReportQuery["salesReport"];
export type TherapistSales = SalesReport["therapists"][number];
export type ServiceSales = SalesReport["services"][number];
export type SalesLine = ServiceSales["lines"][number];
export type SalesBucket = SalesReport["series"][number];
export type UnpricedBooking = SalesReport["unpriced"][number];

export interface SalesReportArgs {
    period: SalesReport["period"];
    /** Any day in the wanted week / month / year, "YYYY-MM-DD" */
    date: string;
    includeUpcoming: boolean;
}
