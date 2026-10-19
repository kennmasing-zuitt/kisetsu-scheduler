import { baseApi } from "@/store/baseApi";
import { UsersDocument, type UsersQuery } from "@/gql/graphql";

export const usersApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        /** Paginated: { data: User[], page, limit, total, totalPages } */
        getUsers: build.query<UsersQuery["users"], void>({
            query: () => ({ document: UsersDocument }),
            transformResponse: (data: UsersQuery) => data.users,
            providesTags: ["User"],
        }),
    }),
});

export const { useGetUsersQuery } = usersApi;
