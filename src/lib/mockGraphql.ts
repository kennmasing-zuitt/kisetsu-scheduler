import type { AuthPayload, User } from "@/types/auth";
import type { GraphqlError } from "./graphqlBaseQuery";

/**
 * In-browser stand-in for the GraphQL server, enabled with NEXT_PUBLIC_MOCK_API=true.
 * Lets you click through every page before the backend is running.
 */

const now = new Date().toISOString();

const users: User[] = [
    {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: { id: "r1", name: "ADMIN" },
        extraPerms: ["readUsers"],
        createdAt: now,
    },
    {
        id: "2",
        name: "Jane Doe",
        email: "jane@example.com",
        role: { id: "r2", name: "USER" },
        extraPerms: [],
        createdAt: now,
    },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const operationName = (document: string) => /(?:mutation|query)\s+(\w+)/.exec(document)?.[1] ?? "";

const authPayload = (user: User): AuthPayload => ({ token: `mock-token-${user.id}`, user });

export async function mockGraphql(
    document: string,
    variables: Record<string, unknown> | undefined,
    token: string | null,
): Promise<{ data: unknown } | { error: GraphqlError }> {
    await delay(300);
    const input = (variables?.input ?? {}) as Record<string, string>;

    switch (operationName(document)) {
        case "Login": {
            const user = users.find((u) => u.email === input.email) ?? users[0];
            return { data: { login: authPayload(user) } };
        }
        case "Register": {
            if (users.some((u) => u.email === input.email)) {
                return {
                    error: { message: "Email is already registered", code: "BAD_USER_INPUT" },
                };
            }
            const user: User = {
                id: String(users.length + 1),
                name: input.name,
                email: input.email,
                role: { id: "r2", name: "USER" },
                extraPerms: [],
                createdAt: new Date().toISOString(),
            };
            users.push(user);
            return { data: { register: authPayload(user) } };
        }
        case "Logout":
            return { data: { logout: true } };
        case "Me": {
            const user = users.find((u) => `mock-token-${u.id}` === token);
            return user
                ? { data: { me: user } }
                : { error: { message: "Not authenticated", code: "UNAUTHENTICATED" } };
        }
        case "Users":
            if (!token) return { error: { message: "Not authenticated", code: "UNAUTHENTICATED" } };
            return {
                data: {
                    users: { data: users, page: 1, limit: 20, total: users.length, totalPages: 1 },
                },
            };
        default:
            return { error: { message: `Mock has no handler for this operation` } };
    }
}
