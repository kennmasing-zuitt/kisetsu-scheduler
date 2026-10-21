import { baseApi } from "@/store/baseApi";
import { SmsLogsDocument, type SmsLogsQuery, type SmsStatus } from "@/gql/graphql";

export type SmsLog = SmsLogsQuery["smsLogs"][number];

export const smsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        /** Text messages, newest first (e.g. only `failed`), needs readSmsLogs */
        getSmsLogs: build.query<SmsLog[], { status?: SmsStatus | null; limit?: number }>({
            query: ({ status, limit }) => ({
                document: SmsLogsDocument,
                variables: { status: status ?? null, limit: limit ?? 50 },
            }),
            transformResponse: (data: SmsLogsQuery) => data.smsLogs,
            providesTags: ["Sms"],
        }),
    }),
});

export const { useGetSmsLogsQuery } = smsApi;
