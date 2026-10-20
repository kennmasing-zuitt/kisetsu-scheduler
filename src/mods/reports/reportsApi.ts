import { baseApi } from "@/store/baseApi";
import {
    SalesReportDocument,
    type SalesReportQuery,
    type SalesReportQueryVariables,
} from "@/gql/graphql";
import type { SalesReport, SalesReportArgs } from "./types";

export const reportsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        /**
         * Weekly (Mon–Sun), monthly or annual sales. Each booking is priced at the price that
         * prevailed on its date. Needs the readReports permission (FORBIDDEN otherwise).
         * Booking and service changes invalidate the "Report" tag, so reports refetch.
         */
        getSalesReport: build.query<SalesReport, SalesReportArgs>({
            query: ({ period, date, includeUpcoming }) => ({
                document: SalesReportDocument,
                variables: { period, date, includeUpcoming } satisfies SalesReportQueryVariables,
            }),
            transformResponse: (data: SalesReportQuery) => data.salesReport,
            providesTags: ["Report"],
        }),
    }),
});

export const { useGetSalesReportQuery } = reportsApi;
