import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlBaseQuery } from "@/lib/graphqlBaseQuery";
import {
    LOGIN_MUTATION,
    LOGOUT_MUTATION,
    ME_QUERY,
    REGISTER_MUTATION,
    USERS_QUERY,
} from "@/graphql/operations";
import type {
    LoginMutation,
    LoginMutationVariables,
    LogoutMutation,
    MeQuery,
    RegisterMutation,
    RegisterMutationVariables,
    UsersQuery,
} from "@/gql/graphql";
import type { AuthPayload, LoginInput, RegisterInput } from "@/types/auth";

/**
 * One RTK Query API slice for every GraphQL operation.
 * Documents and their types come from codegen (src/graphql/operations.ts -> src/gql).
 * To add an endpoint: write the document, run `npm run codegen`, then add it here.
 */
export const api = createApi({
    reducerPath: "api",
    baseQuery: graphqlBaseQuery,
    tagTypes: ["Me", "User"],
    endpoints: (build) => ({
        login: build.mutation<AuthPayload, LoginInput>({
            query: (input) => ({
                document: LOGIN_MUTATION,
                variables: { input } satisfies LoginMutationVariables,
            }),
            transformResponse: (data: LoginMutation) => data.login,
        }),
        register: build.mutation<AuthPayload, RegisterInput>({
            query: (input) => ({
                document: REGISTER_MUTATION,
                variables: { input } satisfies RegisterMutationVariables,
            }),
            transformResponse: (data: RegisterMutation) => data.register,
        }),
        logout: build.mutation<LogoutMutation["logout"], void>({
            query: () => ({ document: LOGOUT_MUTATION }),
            transformResponse: (data: LogoutMutation) => data.logout,
        }),
        me: build.query<MeQuery["me"], void>({
            query: () => ({ document: ME_QUERY }),
            transformResponse: (data: MeQuery) => data.me,
            providesTags: ["Me"],
        }),
        /** Paginated: { data: User[], page, limit, total, totalPages } */
        getUsers: build.query<UsersQuery["users"], void>({
            query: () => ({ document: USERS_QUERY }),
            transformResponse: (data: UsersQuery) => data.users,
            providesTags: ["User"],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useMeQuery,
    useGetUsersQuery,
} = api;
