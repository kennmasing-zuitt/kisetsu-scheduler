import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlBaseQuery } from "@/lib/graphqlBaseQuery";

/**
 * The single RTK Query API slice. It holds no endpoints itself: each module adds its own
 * with `baseApi.injectEndpoints` (see mods/auth/authApi.ts, mods/users/usersApi.ts,
 * mods/schedule/scheduleApi.ts).
 *
 * To add an endpoint: write the operation in a module's graphql/*.graphql file,
 * run `npm run codegen`, then inject it using the generated `<Name>Document` from @/gql/graphql.
 */
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: graphqlBaseQuery,
    tagTypes: [
        "Me",
        "User",
        "Therapist",
        "Room",
        "Service",
        "Promo",
        "Client",
        "Booking",
        "Report",
    ],
    endpoints: () => ({}),
});
