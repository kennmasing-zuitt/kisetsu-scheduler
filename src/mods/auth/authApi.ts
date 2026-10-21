import { baseApi } from "@/store/baseApi";
import {
    ConfirmTwoFactorDocument,
    DisableTwoFactorDocument,
    LoginDocument,
    LoginTwoFactorDocument,
    LogoutDocument,
    MeDocument,
    RegenerateRecoveryCodesDocument,
    RegisterDocument,
    SessionDocument,
    SetupTwoFactorDocument,
    type ConfirmTwoFactorMutation,
    type ConfirmTwoFactorMutationVariables,
    type DisableTwoFactorMutation,
    type DisableTwoFactorMutationVariables,
    type LoginMutation,
    type LoginMutationVariables,
    type LoginTwoFactorMutation,
    type LoginTwoFactorMutationVariables,
    type LogoutMutation,
    type MeQuery,
    type RegenerateRecoveryCodesMutation,
    type RegenerateRecoveryCodesMutationVariables,
    type RegisterMutation,
    type RegisterMutationVariables,
    type SessionQuery,
    type SetupTwoFactorMutation,
    type SetupTwoFactorMutationVariables,
} from "@/gql/graphql";
import type {
    AuthPayload,
    LoginInput,
    LoginResult,
    RegisterInput,
    TwoFactorEnabled,
    TwoFactorSetup,
} from "./types";

export const authApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        /** Step 1: a session, or { twoFactorRequired | twoFactorSetupRequired, challengeToken } */
        login: build.mutation<LoginResult, LoginInput>({
            query: (input) => ({
                document: LoginDocument,
                variables: { input } satisfies LoginMutationVariables,
            }),
            transformResponse: (data: LoginMutation) => data.login,
        }),
        /** Step 2: the authenticator code (or a recovery code) */
        loginTwoFactor: build.mutation<AuthPayload, LoginTwoFactorMutationVariables>({
            query: (variables) => ({ document: LoginTwoFactorDocument, variables }),
            transformResponse: (data: LoginTwoFactorMutation) => data.loginTwoFactor,
        }),
        /** QR code for the authenticator. Signed in, or with the challenge token of a login that requires setup. */
        setupTwoFactor: build.mutation<TwoFactorSetup, SetupTwoFactorMutationVariables | void>({
            query: (variables) => ({
                document: SetupTwoFactorDocument,
                variables: variables ?? {},
            }),
            transformResponse: (data: SetupTwoFactorMutation) => data.setupTwoFactor,
        }),
        /** First code from the app: turns 2FA on, returns recovery codes and a session */
        confirmTwoFactor: build.mutation<TwoFactorEnabled, ConfirmTwoFactorMutationVariables>({
            query: (variables) => ({ document: ConfirmTwoFactorDocument, variables }),
            transformResponse: (data: ConfirmTwoFactorMutation) => data.confirmTwoFactor,
            invalidatesTags: ["Me"],
        }),
        disableTwoFactor: build.mutation<boolean, DisableTwoFactorMutationVariables>({
            query: (variables) => ({ document: DisableTwoFactorDocument, variables }),
            transformResponse: (data: DisableTwoFactorMutation) => data.disableTwoFactor,
            invalidatesTags: ["Me"],
        }),
        regenerateRecoveryCodes: build.mutation<string[], RegenerateRecoveryCodesMutationVariables>(
            {
                query: (variables) => ({ document: RegenerateRecoveryCodesDocument, variables }),
                transformResponse: (data: RegenerateRecoveryCodesMutation) =>
                    data.regenerateRecoveryCodes,
            },
        ),
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
    useLoginTwoFactorMutation,
    useSetupTwoFactorMutation,
    useConfirmTwoFactorMutation,
    useDisableTwoFactorMutation,
    useRegenerateRecoveryCodesMutation,
    useRegisterMutation,
    useLogoutMutation,
    useMeQuery,
    useSessionQuery,
} = authApi;
