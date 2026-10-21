import { baseApi } from "@/store/baseApi";
import {
    ClientBookingsDocument,
    ClientByMobileDocument,
    ClientsDocument,
    ResetClientAppDocument,
    UpdateClientDocument,
    type ClientBookingsQuery,
    type ClientByMobileQuery,
    type ClientsQuery,
    type ClientsQueryVariables,
    type ResetClientAppMutation,
    type UpdateClientMutation,
    type UpdateClientMutationVariables,
} from "@/gql/graphql";
import type { Booking } from "@/mods/schedule/types";
import type { Client, ClientPage, UpdateClientInput } from "./types";

export const clientsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        /** Search by name words or 3+ mobile digits; paginated, with visit counts */
        getClients: build.query<ClientPage, { search?: string; page?: number }>({
            query: ({ search, page }) => ({
                document: ClientsDocument,
                variables: {
                    search: search || null,
                    page: page ?? 1,
                    limit: 20,
                } satisfies ClientsQueryVariables,
            }),
            transformResponse: (data: ClientsQuery) => data.clients,
            providesTags: ["Client"],
        }),
        /** The client with this mobile (canonical form), or null when the number is new */
        getClientByMobile: build.query<Client | null, string>({
            query: (mobile) => ({ document: ClientByMobileDocument, variables: { mobile } }),
            transformResponse: (data: ClientByMobileQuery) => data.clientByMobile ?? null,
            providesTags: ["Client"],
        }),
        /** A client's bookings, newest first */
        getClientBookings: build.query<Booking[], string>({
            query: (clientId) => ({
                document: ClientBookingsDocument,
                variables: { clientId, limit: 20 },
            }),
            transformResponse: (data: ClientBookingsQuery) => data.clientBookings,
            providesTags: ["Client", "Booking"],
        }),
        /** Rename / change mobile or notes; bookings show the new name. Error: CLIENT_MOBILE_TAKEN */
        updateClient: build.mutation<Client, { id: string; input: UpdateClientInput }>({
            query: ({ id, input }) => ({
                document: UpdateClientDocument,
                variables: { id, input } satisfies UpdateClientMutationVariables,
            }),
            transformResponse: (data: UpdateClientMutation) => data.updateClient,
            invalidatesTags: ["Client", "Booking", "Report"],
        }),
        /** Lost phone: turns off the client's app sign-in on the booking site */
        resetClientApp: build.mutation<Client, string>({
            query: (id) => ({ document: ResetClientAppDocument, variables: { id } }),
            transformResponse: (data: ResetClientAppMutation) => data.resetClientApp,
            invalidatesTags: ["Client"],
        }),
    }),
});

export const {
    useGetClientsQuery,
    useGetClientByMobileQuery,
    useGetClientBookingsQuery,
    useUpdateClientMutation,
    useResetClientAppMutation,
} = clientsApi;
