import { baseApi } from "@/store/baseApi";
import {
    LoginDocument,
    LogoutDocument,
    MeDocument,
    RegisterDocument,
    SessionDocument,
    type LoginMutation,
    type LoginMutationVariables,
    type LogoutMutation,
    type MeQuery,
    type RegisterMutation,
    type RegisterMutationVariables,
    type SessionQuery,
} from "@/gql/graphql";
import type { AuthPayload, LoginInput, RegisterInput } from "./types";

export const authApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        login: build.mutation<AuthPayload, LoginInput>({
            query: (input) => ({
                document: LoginDocument,
                variables: { input } satisfies LoginMutationVariables,
            }),
            transformResponse: (data: LoginMutation) => data.login,
        }),
        register: build.mutation<AuthPayload, RegisterInput>({
            query: (input) => ({
                document: RegisterDocument,
                variables: { input } satisfies RegisterMutationVariables,
            }),
            transformResponse: (data: RegisterMutation) => data.register,
        }),
        logout: build.mutation<LogoutMutation["logout"], void>({
            query: () => ({ document: LogoutDocument }),
            transformResponse: (data: LogoutMutation) => data.logout,
        }),
        me: build.query<MeQuery["me"], void>({
            query: () => ({ document: MeDocument }),
            transformResponse: (data: MeQuery) => data.me,
            providesTags: ["Me"],
        }),
        /** What the signed-in user can do: role permissions + extras (all for a super admin). */
        session: build.query<SessionQuery["session"], void>({
            query: () => ({ document: SessionDocument }),
            transformResponse: (data: SessionQuery) => data.session,
            providesTags: ["Me"],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useMeQuery,
    useSessionQuery,
} = authApi;
