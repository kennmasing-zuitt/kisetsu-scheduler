/* eslint-disable */
import * as types from "./graphql";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Logout {\n  logout\n}\n\nquery Me {\n  me {\n    ...UserFields\n  }\n}": typeof types.RegisterDocument;
    "fragment UserFields on User {\n  id\n  name\n  email\n  role {\n    id\n    name\n  }\n  extraPerms\n  createdAt\n}": typeof types.UserFieldsFragmentDoc;
    "query Users {\n  users {\n    data {\n      ...UserFields\n    }\n    page\n    limit\n    total\n    totalPages\n  }\n}": typeof types.UsersDocument;
};
const documents: Documents = {
    "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Logout {\n  logout\n}\n\nquery Me {\n  me {\n    ...UserFields\n  }\n}":
        types.RegisterDocument,
    "fragment UserFields on User {\n  id\n  name\n  email\n  role {\n    id\n    name\n  }\n  extraPerms\n  createdAt\n}":
        types.UserFieldsFragmentDoc,
    "query Users {\n  users {\n    data {\n      ...UserFields\n    }\n    page\n    limit\n    total\n    totalPages\n  }\n}":
        types.UsersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Logout {\n  logout\n}\n\nquery Me {\n  me {\n    ...UserFields\n  }\n}",
): typeof import("./graphql").RegisterDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "fragment UserFields on User {\n  id\n  name\n  email\n  role {\n    id\n    name\n  }\n  extraPerms\n  createdAt\n}",
): typeof import("./graphql").UserFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "query Users {\n  users {\n    data {\n      ...UserFields\n    }\n    page\n    limit\n    total\n    totalPages\n  }\n}",
): typeof import("./graphql").UsersDocument;

export function graphql(source: string) {
    return (documents as any)[source] ?? {};
}
