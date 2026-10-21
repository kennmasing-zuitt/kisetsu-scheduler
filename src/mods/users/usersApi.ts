import { baseApi } from "@/store/baseApi";
import {
    ResetUserTwoFactorDocument,
    UsersDocument,
    type ResetUserTwoFactorMutation,
    type UsersQuery,
} from "@/gql/graphql";

export const usersApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        /** Paginated: { data: User[], page, limit, total, totalPages } */
        getUsers: build.query<UsersQuery["users"], void>({
            query: () => ({ document: UsersDocument }),
            transformResponse: (data: UsersQuery) => data.users,
            providesTags: ["User"],
        }),
        /** Lost phone: turns the user's 2FA off and signs them out everywhere (resetTwoFactor) */
        resetUserTwoFactor: build.mutation<boolean, string>({
            query: (userId) => ({ document: ResetUserTwoFactorDocument, variables: { userId } }),
            transformResponse: (data: ResetUserTwoFactorMutation) => data.resetUserTwoFactor,
            invalidatesTags: ["User"],
        }),
    }),
});

export const { useGetUsersQuery, useResetUserTwoFactorMutation } = usersApi;
