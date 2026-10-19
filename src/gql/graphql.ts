/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
    T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type LoginInput = {
    email: string;
    password: string;
};

/** Granular permissions. Admin permissions (superAdmin, readUsers, manageUserAccess, readRoles, manageRoles, logoutUsers, impersonateUsers, readAuditLogs) only apply through an admin-kind role; superAdmin implies every permission. */
export type Permission =
    | "createExample"
    | "deleteExample"
    | "impersonateUsers"
    | "logoutUsers"
    | "manageRoles"
    | "manageUserAccess"
    | "readAuditLogs"
    | "readRoles"
    | "readUsers"
    | "superAdmin"
    | "updateExample";

export type RegisterInput = {
    /** Normalised to lowercase */
    email: string;
    name: string;
    /** 8-72 characters */
    password: string;
};

export type RegisterMutationVariables = Exact<{
    input: RegisterInput;
}>;

export type RegisterMutation = {
    register: {
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            extraPerms: Array<Permission>;
            createdAt: string;
            role: { id: string; name: string };
        };
    };
};

export type LoginMutationVariables = Exact<{
    input: LoginInput;
}>;

export type LoginMutation = {
    login: {
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            extraPerms: Array<Permission>;
            createdAt: string;
            role: { id: string; name: string };
        };
    };
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { logout: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
    me: {
        id: string;
        name: string;
        email: string;
        extraPerms: Array<Permission>;
        createdAt: string;
        role: { id: string; name: string };
    };
};

export type UserFieldsFragment = {
    id: string;
    name: string;
    email: string;
    extraPerms: Array<Permission>;
    createdAt: string;
    role: { id: string; name: string };
};

export type UsersQueryVariables = Exact<{ [key: string]: never }>;

export type UsersQuery = {
    users: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        data: Array<{
            id: string;
            name: string;
            email: string;
            extraPerms: Array<Permission>;
            createdAt: string;
            role: { id: string; name: string };
        }>;
    };
};

export class TypedDocumentString<TResult, TVariables>
    extends String
    implements DocumentTypeDecoration<TResult, TVariables>
{
    __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>["__apiType"]>;
    private value: string;
    public __meta__?: Record<string, any> | undefined;

    constructor(value: string, __meta__?: Record<string, any> | undefined) {
        super(value);
        this.value = value;
        this.__meta__ = __meta__;
    }

    override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
        return this.value;
    }
}
export const UserFieldsFragmentDoc = new TypedDocumentString(
    `
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
    `,
    { fragmentName: "UserFields" },
) as unknown as TypedDocumentString<UserFieldsFragment, unknown>;
export const RegisterDocument = new TypedDocumentString(`
    mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      ...UserFields
    }
  }
}
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
}`) as unknown as TypedDocumentString<RegisterMutation, RegisterMutationVariables>;
export const LoginDocument = new TypedDocumentString(`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      ...UserFields
    }
  }
}
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
}`) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = new TypedDocumentString(`
    mutation Logout {
  logout
}
    `) as unknown as TypedDocumentString<LogoutMutation, LogoutMutationVariables>;
export const MeDocument = new TypedDocumentString(`
    query Me {
  me {
    ...UserFields
  }
}
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
}`) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const UsersDocument = new TypedDocumentString(`
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
}`) as unknown as TypedDocumentString<UsersQuery, UsersQueryVariables>;
