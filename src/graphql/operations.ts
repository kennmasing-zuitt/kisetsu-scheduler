import { graphql } from "@/gql";

/**
 * Every GraphQL operation the client sends, for express-typescript-graphql-boilerplate-server.
 *
 * After adding or changing one, run `npm run codegen` (server must be running). It checks each
 * document against the live schema, failing on unknown fields, and regenerates src/gql/
 * with the typed documents and their result/variable types.
 * Use the server's real field names here; rename in components if you want different ones.
 */

export const USER_FIELDS = graphql(`
    fragment UserFields on User {
        id
        name
        email
        role {
            id
            name
        }
        extraPerms
        createdAt
    }
`);

export const REGISTER_MUTATION = graphql(`
    mutation Register($input: RegisterInput!) {
        register(input: $input) {
            token
            user {
                ...UserFields
            }
        }
    }
`);

export const LOGIN_MUTATION = graphql(`
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            token
            user {
                ...UserFields
            }
        }
    }
`);

export const LOGOUT_MUTATION = graphql(`
    mutation Logout {
        logout
    }
`);

export const ME_QUERY = graphql(`
    query Me {
        me {
            ...UserFields
        }
    }
`);

export const USERS_QUERY = graphql(`
    query Users {
        users {
            data {
                ...UserFields
            }
            page
            limit
            total
            totalPages
        }
    }
`);
