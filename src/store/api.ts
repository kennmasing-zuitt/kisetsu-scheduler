import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlBaseQuery } from "@/lib/graphqlBaseQuery";
import {
    LOGIN_MUTATION,
    LOGOUT_MUTATION,
    ME_QUERY,
    REGISTER_MUTATION,
    USERS_QUERY,
} from "@/graphql/operations";
import type { AuthPayload, LoginInput, RegisterInput, User } from "@/types/auth";

/**
 * One RTK Query API slice for every GraphQL operation.
 * Add new endpoints here as the backend grows (roles, schedules, POS, ...).
 */
export const api = createApi({
    reducerPath: "api",
    baseQuery: graphqlBaseQuery,
    tagTypes: ["Me", "User"],
    endpoints: (build) => ({
        login: build.mutation<AuthPayload, LoginInput>({
            query: (input) => ({ document: LOGIN_MUTATION, variables: { input } }),
            transformResponse: (data: { login: AuthPayload }) => data.login,
        }),
        register: build.mutation<AuthPayload, RegisterInput>({
            query: (input) => ({ document: REGISTER_MUTATION, variables: { input } }),
            transformResponse: (data: { register: AuthPayload }) => data.register,
        }),
        logout: build.mutation<boolean, void>({
            query: () => ({ document: LOGOUT_MUTATION }),
            transformResponse: (data: { logout: boolean }) => data.logout,
        }),
        me: build.query<User, void>({
            query: () => ({ document: ME_QUERY }),
            transformResponse: (data: { me: User }) => data.me,
            providesTags: ["Me"],
        }),
        getUsers: build.query<User[], void>({
            query: () => ({ document: USERS_QUERY }),
            transformResponse: (data: { users: User[] }) => data.users,
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
