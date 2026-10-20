import type { AuthPayload, User } from "@/mods/auth/types";
import type { Booking, Room, Therapist } from "@/mods/schedule/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

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

const todayAt = (h: number, m = 0) => {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toISOString();
};

let therapists: Therapist[] = [
    { id: "ana", name: "Ana", offDays: [0], leaveDates: [] }, // off Sun
    { id: "ben", name: "Ben", offDays: [2, 3], leaveDates: [] }, // off Tue, Wed
    { id: "carla", name: "Carla", offDays: [1], leaveDates: [] }, // off Mon
    { id: "dana", name: "Dana", offDays: [0, 6], leaveDates: [] }, // off Sat, Sun
];

let rooms: Room[] = [
    { id: "room-1", name: "Room 1", color: "#534AB7" },
    { id: "room-2", name: "Room 2", color: "#0F6E56" },
    { id: "room-3", name: "Room 3", color: "#993C1D" },
    { id: "room-4", name: "Room 4", color: "#993556" },
];

let bookings: Booking[] = [
    {
        id: "b1",
        client: "Mr. Cruz",
        therapistId: "ana",
        roomId: "room-1",
        start: todayAt(15),
        end: todayAt(17, 30),
    },
    {
        id: "b2",
        client: "Ms. Reyes",
        therapistId: "ben",
        roomId: "room-2",
        start: todayAt(15),
        end: todayAt(16),
    },
    {
        id: "b3",
        client: "Mr. Lim",
        therapistId: "ben",
        roomId: "room-2",
        start: todayAt(16, 30),
        end: todayAt(17, 30),
    },
    {
        id: "b4",
        client: "Mrs. Santos",
        therapistId: "carla",
        roomId: "room-3",
        start: todayAt(15, 30),
        end: todayAt(17, 30),
    },
    {
        id: "b5",
        client: "Ms. Tan",
        therapistId: "dana",
        roomId: "room-4",
        start: todayAt(13, 30),
        end: todayAt(14, 30),
    },
];

let nextId = 100;
const newId = () => `mock-${nextId++}`;
/** Fields that were sent (GraphQL clients may send null for "unchanged") */
const sent = <T extends object>(input: T) =>
    Object.fromEntries(
        Object.entries(input).filter(([, v]) => v !== undefined && v !== null),
    ) as Partial<T>;
const notFound = (what: string) => ({ error: { message: `${what} not found`, code: "NOT_FOUND" } });

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
    const id = variables?.id as string | undefined;
    const op = operationName(document);
    const isAuthOp = ["Login", "Register", "Logout", "Me"].includes(op);
    if (!isAuthOp && !token) {
        return { error: { message: "Not authenticated", code: "UNAUTHENTICATED" } };
    }

    // Schedule operations: CRUD only. The real server also enforces opening hours, days off and
    // overlaps (the UI checks those too, so the mock behaves close enough).
    switch (op) {
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
        case "Therapists":
            return { data: { therapists } };
        case "CreateTherapist": {
            const t = {
                offDays: [],
                leaveDates: [],
                ...sent(variables!.input as Partial<Therapist>),
                id: newId(),
            } as Therapist;
            therapists = [...therapists, t];
            return { data: { createTherapist: t } };
        }
        case "UpdateTherapist": {
            const t = therapists.find((x) => x.id === id);
            if (!t) return notFound("Therapist");
            const updated = { ...t, ...sent(variables!.input as Partial<Therapist>) };
            therapists = therapists.map((x) => (x.id === id ? updated : x));
            return { data: { updateTherapist: updated } };
        }
        case "DeleteTherapist":
            if (!therapists.some((x) => x.id === id)) return notFound("Therapist");
            therapists = therapists.filter((x) => x.id !== id);
            return { data: { deleteTherapist: true } };
        case "Rooms":
            return { data: { rooms } };
        case "CreateRoom": {
            const r = { ...(variables!.input as Omit<Room, "id">), id: newId() };
            rooms = [...rooms, r];
            return { data: { createRoom: r } };
        }
        case "UpdateRoom": {
            const r = rooms.find((x) => x.id === id);
            if (!r) return notFound("Room");
            const updated = { ...r, ...sent(variables!.input as Partial<Room>) };
            rooms = rooms.map((x) => (x.id === id ? updated : x));
            return { data: { updateRoom: updated } };
        }
        case "DeleteRoom":
            if (!rooms.some((x) => x.id === id)) return notFound("Room");
            rooms = rooms.filter((x) => x.id !== id);
            return { data: { deleteRoom: true } };
        case "Bookings": {
            const from = Date.parse(variables!.from as string);
            const to = Date.parse(variables!.to as string);
            const inRange = bookings
                .filter((b) => Date.parse(b.start) < to && Date.parse(b.end) > from)
                .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
            return { data: { bookings: inRange } };
        }
        case "CreateBooking": {
            const b = { ...(variables!.input as Omit<Booking, "id">), id: newId() };
            bookings = [...bookings, b];
            return { data: { createBooking: b } };
        }
        case "UpdateBooking": {
            const b = bookings.find((x) => x.id === id);
            if (!b) return notFound("Booking");
            const updated = { ...b, ...sent(variables!.input as Partial<Booking>) };
            bookings = bookings.map((x) => (x.id === id ? updated : x));
            return { data: { updateBooking: updated } };
        }
        case "DeleteBooking":
            if (!bookings.some((x) => x.id === id)) return notFound("Booking");
            bookings = bookings.filter((x) => x.id !== id);
            return { data: { deleteBooking: true } };
        default:
            return { error: { message: `Mock has no handler for this operation` } };
    }
}
