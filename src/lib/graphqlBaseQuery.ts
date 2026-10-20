import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { clearCredentials } from "@/mods/auth/authSlice";
import type { TypedDocumentString } from "@/gql/graphql";
import { mockGraphql } from "./mocks/mockGraphql";

export interface GraphqlRequest {
    /** A generated `<Name>Document` from @/gql/graphql */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document: TypedDocumentString<any, any>;
    variables?: Record<string, unknown>;
}

export interface GraphqlError {
    message: string;
    code?: string; // extensions.code, e.g. "UNAUTHENTICATED" | "FORBIDDEN"
}

interface RootStateLike {
    auth: { accessToken: string | null };
}

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:2200/graphql";
const USE_MOCK = process.env.NEXT_PUBLIC_MOCK_API === "true";

/**
 * Minimal GraphQL base query for RTK Query.
 * - Sends the access token as a Bearer header
 * - Sends cookies (credentials: "include") so an httpOnly refresh-token cookie works if the server uses one
 * - Returns the first GraphQL error as `error` so components can show it
 */
export const graphqlBaseQuery: BaseQueryFn<GraphqlRequest, unknown, GraphqlError> = async (
    { document, variables },
    api,
) => {
    const token = (api.getState() as RootStateLike).auth.accessToken;

    const result = USE_MOCK
        ? await mockGraphql(document.toString(), variables, token)
        : await sendRequest(document.toString(), variables, token, api.signal);

    // Token expired or revoked: drop the session so AuthGuard sends the user to /login.
    if ("error" in result && result.error.code === "UNAUTHENTICATED" && token) {
        api.dispatch(clearCredentials());
    }
    return result;
};

async function sendRequest(
    document: string,
    variables: Record<string, unknown> | undefined,
    token: string | null,
    signal: AbortSignal,
): Promise<{ data: unknown } | { error: GraphqlError }> {
    try {
        const res = await fetch(GRAPHQL_URL, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ query: document, variables }),
            signal,
        });

        const json = (await res.json()) as {
            data?: Record<string, unknown>;
            errors?: { message: string; extensions?: { code?: string } }[];
        };

        if (json.errors?.length) {
            const [first] = json.errors;
            return { error: { message: first.message, code: first.extensions?.code } };
        }
        if (!res.ok) {
            return { error: { message: `Request failed (${res.status})` } };
        }
        return { data: json.data };
    } catch (err) {
        return { error: { message: err instanceof Error ? err.message : "Network error" } };
    }
}
