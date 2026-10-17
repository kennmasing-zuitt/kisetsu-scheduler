/**
 * GraphQL documents for express-typescript-graphql-boilerplate-server.
 *
 * These are ANTICIPATED shapes based on a typical type-graphql auth + RBAC setup:
 *   - register / login return an AuthPayload { accessToken, user }
 *   - logout returns Boolean
 *   - me returns the current User
 *   - users returns [User] (admin-only on the server via RBAC)
 *
 * If your resolver names, input types, or User fields differ, change them HERE
 * (and the matching types in src/types/auth.ts). Nothing else in the app
 * hardcodes field names.
 */

export const USER_FIELDS = /* GraphQL */ `
  fragment UserFields on User {
    id
    name
    email
    role {
      id
      name
    }
    permissions
    createdAt
  }
`;

export const REGISTER_MUTATION = /* GraphQL */ `
  ${USER_FIELDS}
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        ...UserFields
      }
    }
  }
`;

export const LOGIN_MUTATION = /* GraphQL */ `
  ${USER_FIELDS}
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        ...UserFields
      }
    }
  }
`;

export const LOGOUT_MUTATION = /* GraphQL */ `
  mutation Logout {
    logout
  }
`;

export const ME_QUERY = /* GraphQL */ `
  ${USER_FIELDS}
  query Me {
    me {
      ...UserFields
    }
  }
`;

export const USERS_QUERY = /* GraphQL */ `
  ${USER_FIELDS}
  query Users {
    users {
      ...UserFields
    }
  }
`;
