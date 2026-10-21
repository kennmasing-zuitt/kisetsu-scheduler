/**
 * App-facing auth types, derived from the codegen output in src/gql.
 * Don't hand-edit shapes here: change mods/auth/graphql/auth.graphql (or users/graphql/user.fragment.graphql)
 * and run `npm run codegen`.
 */
import type {
    ConfirmTwoFactorMutation,
    LoginMutation,
    RegisterMutation,
    SetupTwoFactorMutation,
    UserFieldsFragment,
} from "@/gql/graphql";

export type { LoginInput, Permission, RegisterInput } from "@/gql/graphql";

export type User = UserFieldsFragment;
export type Role = User["role"];
/** What register and login return: { token, user } */
export type AuthPayload = RegisterMutation["register"];
/** What login returns: a session, or the next two-factor step (see LoginTwoFactor / SetupTwoFactor) */
export type LoginResult = LoginMutation["login"];
/** QR code + secret for an authenticator app */
export type TwoFactorSetup = SetupTwoFactorMutation["setupTwoFactor"];
/** Session + one-time recovery codes after turning 2FA on */
export type TwoFactorEnabled = ConfirmTwoFactorMutation["confirmTwoFactor"];
