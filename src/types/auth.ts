/**
 * App-facing auth types, derived from the codegen output in src/gql.
 * Don't hand-edit shapes here: change the documents in src/graphql/operations.ts
 * and run `npm run codegen`.
 */
import type { RegisterMutation, UserFieldsFragment } from "@/gql/graphql";

export type { LoginInput, Permission, RegisterInput } from "@/gql/graphql";

export type User = UserFieldsFragment;
export type Role = User["role"];
/** What register and login return: { token, user } */
export type AuthPayload = RegisterMutation["register"];
