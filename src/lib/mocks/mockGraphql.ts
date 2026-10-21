import type { AuthPayload, User } from "@/mods/auth/types";
import type { Booking, Promo, Room, Service, Therapist } from "@/mods/schedule/types";
import type { SalesReport } from "@/mods/reports/types";
import { findServicePrice, priceDayOf } from "@/mods/schedule/lib/pricing";
import { toDateKey } from "@/mods/schedule/lib/availability";
import { promoDiscount } from "@/mods/schedule/lib/promos";
import { MOBILE_HINT, normalizeMobile } from "@/mods/clients/lib/mobile";
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
        twoFactorEnabled: true,
        createdAt: now,
    },
    {
        id: "2",
        name: "Jane Doe",
        email: "jane@example.com",
        role: { id: "r2", name: "USER" },
        extraPerms: [],
        twoFactorEnabled: false,
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

const PRICES_FROM = "2025-01-01";
let services: Service[] = [
    {
        id: "fuyu",
        name: "Fuyu",
        description: "",
        isActive: true,
        prices: [
            {
                id: "p1",
                durationMin: 60,
                days: [],
                amount: 1099,
                validFrom: PRICES_FROM,
                validTo: null,
            },
            {
                id: "p2",
                durationMin: 80,
                days: [],
                amount: 1199,
                validFrom: PRICES_FROM,
                validTo: null,
            },
        ],
    },
    {
        id: "natsu",
        name: "Natsu",
        description: "",
        isActive: true,
        prices: [
            {
                id: "p3",
                durationMin: 60,
                days: [],
                amount: 1299,
                validFrom: PRICES_FROM,
                validTo: null,
            },
            {
                id: "p4",
                durationMin: 80,
                days: [],
                amount: 1399,
                validFrom: PRICES_FROM,
                validTo: null,
            },
        ],
    },
    {
        id: "haru",
        name: "Haru",
        description: "",
        isActive: true,
        prices: [
            {
                id: "p5",
                durationMin: 80,
                days: [],
                amount: 1599,
                validFrom: PRICES_FROM,
                validTo: null,
            },
        ],
    },
    {
        id: "shiki",
        name: "Shiki",
        description: "",
        isActive: true,
        prices: [
            {
                id: "p6",
                durationMin: 120,
                days: [],
                amount: 2499,
                validFrom: PRICES_FROM,
                validTo: null,
            },
        ],
    },
    {
        id: "aki",
        name: "Aki",
        description: "",
        isActive: true,
        prices: [
            {
                id: "p7",
                durationMin: null,
                days: [1, 2, 3, 4],
                amount: 699,
                validFrom: PRICES_FROM,
                validTo: null,
            },
            {
                id: "p8",
                durationMin: null,
                days: [0, 5, 6],
                amount: 799,
                validFrom: PRICES_FROM,
                validTo: null,
            },
        ],
    },
];

// ---------- Clients & promos ----------
interface MockClient {
    id: string;
    mobile: string;
    firstName: string;
    lastName: string;
    notes: string;
    createdAt: string;
    /** Set up app sign-in for the booking site */
    appEnabledAt?: string | null;
}

let clients: MockClient[] = [
    {
        id: "c1",
        mobile: "+639171234567",
        firstName: "Juan",
        lastName: "Cruz",
        notes: "Prefers light pressure",
        createdAt: now,
        appEnabledAt: now,
    },
    {
        id: "c2",
        mobile: "+639181234567",
        firstName: "Maria",
        lastName: "Reyes",
        notes: "",
        createdAt: now,
    },
    {
        id: "c3",
        mobile: "+639191234567",
        firstName: "Paolo",
        lastName: "Lim",
        notes: "",
        createdAt: now,
    },
    {
        id: "c4",
        mobile: "+639201234567",
        firstName: "Ana",
        lastName: "Santos",
        notes: "",
        createdAt: now,
    },
    {
        id: "c5",
        mobile: "+639211234567",
        firstName: "Liza",
        lastName: "Tan",
        notes: "",
        createdAt: now,
    },
];

let promos: Promo[] = [
    {
        id: "pr1",
        code: "KISETSU10",
        description: "10% off for members",
        discountType: "percent",
        value: 10,
        validFrom: PRICES_FROM,
        validTo: null,
        serviceIds: [],
        isActive: true,
        timesUsed: 0,
        isLocked: false,
    },
    {
        id: "pr2",
        code: "AKI100",
        description: "₱100 off Aki",
        discountType: "amount",
        value: 100,
        validFrom: PRICES_FROM,
        validTo: null,
        serviceIds: ["aki"],
        isActive: true,
        timesUsed: 0,
        isLocked: false,
    },
];

const fullName = (c: MockClient) => [c.firstName, c.lastName].filter(Boolean).join(" ");

const booking = (
    id: string,
    client: MockClient,
    therapistId: string,
    roomId: string,
    serviceId: string,
    start: string,
    end: string,
    extra: Partial<Booking> = {},
): Booking => ({
    id,
    client: fullName(client),
    clientId: client.id,
    clientMobile: client.mobile,
    isRequested: false,
    promoId: null,
    promoCode: null,
    therapistId,
    roomId,
    serviceId,
    start,
    end,
    status: "booked",
    source: "staff",
    ...extra,
});

let bookings: Booking[] = [
    booking("b1", clients[0], "ana", "room-1", "haru", todayAt(15), todayAt(16, 20), {
        isRequested: true,
    }),
    booking("b2", clients[1], "ben", "room-2", "fuyu", todayAt(15), todayAt(16), {
        promoId: "pr1",
        promoCode: "KISETSU10",
    }),
    booking("b3", clients[2], "ben", "room-2", "natsu", todayAt(16, 30), todayAt(17, 30), {
        source: "client", // booked online on kisetsuspa.com/book
        isRequested: true,
    }),
    booking("b4", clients[3], "carla", "room-3", "shiki", todayAt(15, 30), todayAt(17, 30), {
        isRequested: true,
    }),
    booking("b5", clients[4], "dana", "room-4", "aki", todayAt(13, 30), todayAt(14, 30)),
];

// A few weeks of past bookings, so reports and client histories have something to show
const PAST_PLAN: [string, string, number][] = [
    ["ana", "fuyu", 60],
    ["ben", "natsu", 80],
    ["carla", "aki", 90],
    ["dana", "shiki", 120],
    ["ana", "haru", 80],
    ["ben", "fuyu", 80],
];
for (let day = 1; day <= 40; day++) {
    for (let k = 0; k < 1 + (day % 3); k++) {
        const [therapistId, serviceId, minutes] = PAST_PLAN[(day + k) % PAST_PLAN.length];
        const start = new Date();
        start.setDate(start.getDate() - day);
        start.setHours(11 + k * 3, 0, 0, 0);
        const client = clients[(day + k) % clients.length];
        bookings.push(
            booking(
                `past-${day}-${k}`,
                client,
                therapistId,
                `room-${(k % 4) + 1}`,
                serviceId,
                start.toISOString(),
                new Date(start.getTime() + minutes * 60_000).toISOString(),
                {
                    isRequested: (day + k) % 3 === 0,
                    ...(day % 5 === 0 ? { promoId: "pr1", promoCode: "KISETSU10" } : {}),
                },
            ),
        );
    }
}

/** A client as the API returns it: with full name and visit counts */
function clientView(c: MockClient) {
    const nowMs = Date.now();
    const mine = active().filter((b) => b.clientId === c.id);
    const visits = mine.filter((b) => Date.parse(b.end) <= nowMs);
    const starts = visits.map((b) => b.start).sort();
    const byTherapist = new Map<string, number>();
    for (const b of visits)
        byTherapist.set(b.therapistId, (byTherapist.get(b.therapistId) ?? 0) + 1);
    const favourite = [...byTherapist].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return {
        ...c,
        appEnabledAt: c.appEnabledAt ?? null,
        fullName: fullName(c),
        stats: {
            visits: visits.length,
            upcoming: mine.length - visits.length,
            firstVisit: starts[0] ?? null,
            lastVisit: starts.at(-1) ?? null,
            requested: visits.filter((b) => b.isRequested).length,
            favouriteTherapistId: favourite,
            favouriteTherapistName: therapists.find((t) => t.id === favourite)?.name ?? null,
        },
    };
}

const promoView = (pr: Promo): Promo => {
    const timesUsed = active().filter((b) => b.promoId === pr.id).length;
    return { ...pr, timesUsed, isLocked: timesUsed > 0 };
};

/** Finds the client by mobile or creates them (the real server does the same) */
function clientFor(
    input: Record<string, unknown>,
): { client: MockClient } | { error: GraphqlError } {
    const mobile = normalizeMobile(String(input.clientMobile ?? ""));
    if (!mobile) return { error: { message: MOBILE_HINT, code: "VALIDATION_ERROR" } };
    let client = clients.find((c) => c.mobile === mobile);
    if (!client) {
        if (!input.clientFirstName)
            return {
                error: {
                    message: "Enter the first name: this mobile number is a new client",
                    code: "VALIDATION_ERROR",
                },
            };
        client = {
            id: `c-${clients.length + 1}`,
            mobile,
            firstName: String(input.clientFirstName),
            lastName: String(input.clientLastName ?? ""),
            notes: "",
            createdAt: new Date().toISOString(),
        };
        clients = [...clients, client];
    }
    return { client };
}

const promoFor = (code: unknown) => {
    const c = String(code ?? "")
        .trim()
        .toUpperCase();
    return c ? promos.find((x) => x.code === c) : undefined;
};

/** Bookings that hold their slot (cancelled ones are kept, like on the server) */
const active = () => bookings.filter((b) => b.status !== "cancelled");

interface MockSms {
    id: string;
    to: string;
    purpose: "setupCode" | "rebook";
    message: string;
    status: "sent" | "failed" | "sending";
    attempts: number;
    error: string | null;
    bookingId: string | null;
    clientId: string | null;
    createdAt: string;
    sentAt: string | null;
}
let smsLogs: MockSms[] = [
    {
        id: "sms-1",
        to: "+639181234567",
        purpose: "rebook",
        message:
            "Hi Maria, sorry: Ben is no longer available for your Sat, 3:00 PM booking at Kisetsu Spa, so it was cancelled. Please rebook at https://kisetsuspa.com/book.",
        status: "failed",
        attempts: 3,
        error: "Semaphore status Failed",
        bookingId: null,
        clientId: "c2",
        createdAt: now,
        sentAt: null,
    },
];
const textClient = (b: Booking, message: string) => {
    if (!b.clientMobile) return;
    smsLogs = [
        {
            id: `sms-${smsLogs.length + 1}`,
            to: b.clientMobile,
            purpose: "rebook",
            message,
            status: "sent",
            attempts: 1,
            error: null,
            bookingId: b.id,
            clientId: b.clientId,
            createdAt: new Date().toISOString(),
            sentAt: new Date().toISOString(),
        },
        ...smsLogs,
    ];
};
// Objects handed to the app are frozen by Redux, so updates replace them instead of mutating
const cancel = (bookingId: string) => {
    bookings = bookings.map((x) => (x.id === bookingId ? { ...x, status: "cancelled" } : x));
};
const setUser = (userId: string, patch: Partial<User>) => {
    const i = users.findIndex((u) => u.id === userId);
    users[i] = { ...users[i], ...patch };
    return users[i];
};
const firstName = (b: Booking) => b.client.split(" ")[0];
const whenLabel = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
/** Upcoming bookings of a therapist on days they'd be off with these lists */
const conflictsFor = (t: Therapist, offDays: number[], leaveDates: string[]) =>
    active().filter((b) => {
        if (b.therapistId !== t.id || Date.parse(b.start) <= Date.now()) return false;
        const d = new Date(b.start);
        return offDays.includes(d.getDay()) || leaveDates.includes(toDateKey(d));
    });
const MOCK_QR =
    "data:image/svg+xml," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#fff"/><rect x="20" y="20" width="50" height="50" fill="#111"/><rect x="130" y="20" width="50" height="50" fill="#111"/><rect x="20" y="130" width="50" height="50" fill="#111"/><text x="100" y="110" text-anchor="middle" font-family="sans-serif" font-size="14">mock QR</text></svg>',
    );
const RECOVERY = Array.from({ length: 10 }, (_, i) => `mock-${String(1000 + i).slice(1)}a`);
const isCode = (c: unknown) => /^\d{6}$/.test(String(c ?? "").replace(/\s/g, ""));
const isRecovery = (c: unknown) => /^[a-z0-9]{4}-?[a-z0-9]{4}$/i.test(String(c ?? "").trim());
const userFromChallenge = (t: unknown) => users.find((u) => `mock-challenge-${u.id}` === t);

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
    const isAuthOp = [
        "Login",
        "LoginTwoFactor",
        "SetupTwoFactor",
        "ConfirmTwoFactor",
        "Register",
        "Logout",
        "Me",
        "Session",
    ].includes(op);
    if (!isAuthOp && !token) {
        return { error: { message: "Not authenticated", code: "UNAUTHENTICATED" } };
    }

    // Schedule operations: CRUD only. The real server also enforces opening hours, days off and
    // overlaps (the UI checks those too, so the mock behaves close enough).
    switch (op) {
        case "Login": {
            // Mock 2FA: the admin has it on; any 6-digit code (or a xxxx-xxxx recovery code) works
            const user = users.find((u) => u.email === input.email) ?? users[0];
            if (user.twoFactorEnabled)
                return {
                    data: {
                        login: {
                            token: null,
                            user: null,
                            twoFactorRequired: true,
                            twoFactorSetupRequired: false,
                            challengeToken: `mock-challenge-${user.id}`,
                        },
                    },
                };
            return {
                data: {
                    login: {
                        ...authPayload(user),
                        twoFactorRequired: false,
                        twoFactorSetupRequired: false,
                        challengeToken: null,
                    },
                },
            };
        }
        case "LoginTwoFactor": {
            const user = userFromChallenge(variables?.challengeToken);
            if (!user)
                return {
                    error: {
                        message: "This step expired. Please start again.",
                        code: "TWO_FACTOR_CHALLENGE_EXPIRED",
                    },
                };
            if (!isCode(variables?.code) && !isRecovery(variables?.code))
                return {
                    error: {
                        message: "That code is not right. Try the newest code.",
                        code: "INVALID_TWO_FACTOR_CODE",
                    },
                };
            return { data: { loginTwoFactor: authPayload(user) } };
        }
        case "SetupTwoFactor":
            return {
                data: {
                    setupTwoFactor: {
                        secret: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP",
                        otpauthUrl: "otpauth://totp/Kisetsu%20Spa:mock?secret=JBSWY3DPEHPK3PXP",
                        qrDataUrl: MOCK_QR,
                    },
                },
            };
        case "ConfirmTwoFactor": {
            const user =
                userFromChallenge(variables?.challengeToken) ??
                users.find((u) => `mock-token-${u.id}` === token);
            if (!user) return { error: { message: "Not authenticated", code: "UNAUTHENTICATED" } };
            if (!isCode(variables?.code))
                return {
                    error: {
                        message: "That code is not right. Try the newest code.",
                        code: "INVALID_TWO_FACTOR_CODE",
                    },
                };
            const on = setUser(user.id, { twoFactorEnabled: true });
            return {
                data: { confirmTwoFactor: { ...authPayload(on), recoveryCodes: RECOVERY } },
            };
        }
        case "DisableTwoFactor": {
            const user = users.find((u) => `mock-token-${u.id}` === token);
            if (user) setUser(user.id, { twoFactorEnabled: false });
            return { data: { disableTwoFactor: true } };
        }
        case "RegenerateRecoveryCodes":
            return { data: { regenerateRecoveryCodes: RECOVERY } };
        case "ResetUserTwoFactor": {
            const user = users.find((u) => u.id === variables?.userId);
            if (!user) return notFound("User");
            setUser(user.id, { twoFactorEnabled: false });
            return { data: { resetUserTwoFactor: true } };
        }
        case "SmsLogs": {
            const status = variables?.status as string | null | undefined;
            return {
                data: { smsLogs: status ? smsLogs.filter((m) => m.status === status) : smsLogs },
            };
        }
        case "TherapistConflicts": {
            const t = therapists.find((x) => x.id === id);
            if (!t) return notFound("Therapist");
            return {
                data: {
                    therapistConflicts: conflictsFor(
                        t,
                        (variables?.offDays as number[] | null) ?? t.offDays,
                        (variables?.leaveDates as string[] | null) ?? t.leaveDates,
                    ),
                },
            };
        }
        case "ResetClientApp": {
            const c = clients.find((x) => x.id === id);
            if (!c) return notFound("Client");
            const reset = { ...c, appEnabledAt: null };
            clients = clients.map((x) => (x.id === c.id ? reset : x));
            return { data: { resetClientApp: clientView(reset) } };
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
                twoFactorEnabled: false,
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
        case "Session":
            if (!token) return { error: { message: "Not authenticated", code: "UNAUTHENTICATED" } };
            // The mock user may do everything, so every action shows up
            return {
                data: {
                    session: {
                        twoFactorRequired:
                            users.find((u) => `mock-token-${u.id}` === token)?.role.name ===
                            "ADMIN",
                        effectivePerms: [
                            "readUsers",
                            "resetTwoFactor",
                            "readSmsLogs",
                            "createTherapist",
                            "updateTherapist",
                            "deleteTherapist",
                            "createRoom",
                            "updateRoom",
                            "deleteRoom",
                            "createBooking",
                            "updateBooking",
                            "deleteBooking",
                            "createService",
                            "updateService",
                            "deleteService",
                            "readReports",
                            "readClients",
                            "updateClient",
                            "createPromo",
                            "updatePromo",
                            "deletePromo",
                        ],
                    },
                },
            };
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
            // Like the server: bookings on days the therapist no longer works are cancelled
            for (const b of conflictsFor(updated, updated.offDays, updated.leaveDates)) {
                cancel(b.id);
                textClient(
                    b,
                    `Hi ${firstName(b)}, sorry: ${updated.name} is no longer available for your ${whenLabel(b.start)} booking at Kisetsu Spa, so it was cancelled. Please rebook at https://kisetsuspa.com/book.`,
                );
            }
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
        case "Services": {
            const all = Boolean(variables?.includeArchived);
            return { data: { services: services.filter((s) => all || s.isActive) } };
        }
        case "CreateService": {
            const input = variables!.input as Omit<Service, "id" | "prices"> & {
                prices: Omit<Service["prices"][number], "id">[];
            };
            const svc: Service = {
                ...input,
                description: input.description ?? "",
                isActive: input.isActive ?? true,
                id: newId(),
                prices: input.prices.map((p) => ({
                    ...p,
                    id: newId(),
                    durationMin: p.durationMin ?? null,
                    days: p.days ?? [],
                    validTo: p.validTo ?? null,
                })),
            };
            services = [...services, svc];
            return { data: { createService: svc } };
        }
        case "UpdateService": {
            const svc = services.find((x) => x.id === id);
            if (!svc) return notFound("Service");
            const input = sent(variables!.input as Partial<Service>);
            const updated: Service = {
                ...svc,
                ...input,
                prices: (input.prices ?? svc.prices).map((p) => ({
                    ...p,
                    id: p.id ?? newId(),
                    durationMin: p.durationMin ?? null,
                    days: p.days ?? [],
                    validTo: p.validTo ?? null,
                })),
            };
            services = services.map((x) => (x.id === id ? updated : x));
            return { data: { updateService: updated } };
        }
        case "DeleteService":
            if (bookings.some((b) => b.serviceId === id))
                return {
                    error: {
                        message: "This service has bookings. Archive it instead.",
                        code: "SERVICE_IN_USE",
                    },
                };
            services = services.filter((x) => x.id !== id);
            return { data: { deleteService: true } };
        case "Clients": {
            const q = String(variables?.search ?? "")
                .trim()
                .toLowerCase();
            const digits = q.replace(/\D/g, "").replace(/^(?:63|0)/, "");
            const list = clients
                .filter(
                    (c) =>
                        !q ||
                        q.split(/\s+/).every((w) => fullName(c).toLowerCase().includes(w)) ||
                        (digits.length >= 3 && c.mobile.includes(digits)),
                )
                .sort((a, b) => fullName(a).localeCompare(fullName(b)))
                .map(clientView);
            return {
                data: {
                    clients: { data: list, page: 1, limit: 20, total: list.length, totalPages: 1 },
                },
            };
        }
        case "ClientByMobile": {
            const mobile = normalizeMobile(String(variables?.mobile ?? ""));
            if (!mobile) return { error: { message: MOBILE_HINT, code: "VALIDATION_ERROR" } };
            const c = clients.find((x) => x.mobile === mobile);
            return { data: { clientByMobile: c ? clientView(c) : null } };
        }
        case "ClientBookings": {
            const list = bookings
                .filter((b) => b.clientId === variables?.clientId)
                .sort((a, b) => Date.parse(b.start) - Date.parse(a.start))
                .slice(0, 20);
            return { data: { clientBookings: list } };
        }
        case "UpdateClient": {
            const c = clients.find((x) => x.id === id);
            if (!c) return notFound("Client");
            const input = sent(variables!.input as Partial<MockClient>);
            const mobile = input.mobile ? normalizeMobile(input.mobile) : c.mobile;
            if (!mobile) return { error: { message: MOBILE_HINT, code: "VALIDATION_ERROR" } };
            if (clients.some((x) => x.id !== c.id && x.mobile === mobile))
                return {
                    error: {
                        message: "Another client already has this mobile number",
                        code: "CLIENT_MOBILE_TAKEN",
                    },
                };
            const updated = { ...c, ...input, mobile };
            clients = clients.map((x) => (x.id === id ? updated : x));
            bookings = bookings.map((b) =>
                b.clientId === id ? { ...b, client: fullName(updated), clientMobile: mobile } : b,
            );
            return { data: { updateClient: clientView(updated) } };
        }
        case "Promos": {
            const all = Boolean(variables?.includeArchived);
            return { data: { promos: promos.filter((x) => all || x.isActive).map(promoView) } };
        }
        case "CreatePromo": {
            const input = variables!.input as Omit<Promo, "id" | "timesUsed" | "isLocked">;
            const code = input.code.toUpperCase();
            if (promos.some((x) => x.code === code))
                return {
                    error: {
                        message: `The promo code ${code} already exists`,
                        code: "PROMO_CODE_TAKEN",
                    },
                };
            const pr: Promo = {
                ...input,
                description: input.description ?? "",
                serviceIds: input.serviceIds ?? [],
                validTo: input.validTo ?? null,
                isActive: input.isActive ?? true,
                code,
                id: newId(),
                timesUsed: 0,
                isLocked: false,
            };
            promos = [...promos, pr];
            return { data: { createPromo: promoView(pr) } };
        }
        case "UpdatePromo": {
            const pr = promos.find((x) => x.id === id);
            if (!pr) return notFound("Promo");
            const input = variables!.input as Partial<Promo>;
            const view = promoView(pr);
            const terms = (["code", "discountType", "value", "serviceIds"] as const).filter(
                (k) => input[k] !== undefined && JSON.stringify(input[k]) !== JSON.stringify(pr[k]),
            );
            if (view.isLocked && terms.length)
                return {
                    error: {
                        message: `${pr.code} has been used, so its terms can't change. Create a new code instead.`,
                        code: "PROMO_LOCKED",
                    },
                };
            const updated = {
                ...pr,
                ...sent(input),
                ...("validTo" in input ? { validTo: input.validTo ?? null } : {}),
            };
            promos = promos.map((x) => (x.id === id ? updated : x));
            return { data: { updatePromo: promoView(updated) } };
        }
        case "DeletePromo": {
            const pr = promos.find((x) => x.id === id);
            if (!pr) return notFound("Promo");
            if (promoView(pr).isLocked)
                return {
                    error: {
                        message: `${pr.code} was used. Archive it instead.`,
                        code: "PROMO_IN_USE",
                    },
                };
            promos = promos.filter((x) => x.id !== id);
            return { data: { deletePromo: true } };
        }
        case "SalesReport":
            return { data: { salesReport: mockSalesReport(variables!) } };
        case "Bookings": {
            const from = Date.parse(variables!.from as string);
            const to = Date.parse(variables!.to as string);
            const inRange = active()
                .filter((b) => Date.parse(b.start) < to && Date.parse(b.end) > from)
                .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
            return { data: { bookings: inRange } };
        }
        case "CreateBooking": {
            const input = variables!.input as Record<string, unknown>;
            const found = clientFor(input);
            if ("error" in found) return { error: found.error };
            const promo = promoFor(input.promoCode);
            if (input.promoCode && !promo)
                return {
                    error: {
                        message: "That promo code doesn't exist",
                        code: "PROMO_NOT_APPLICABLE",
                    },
                };
            const b = booking(
                newId(),
                found.client,
                String(input.therapistId),
                String(input.roomId),
                String(input.serviceId),
                String(input.start),
                String(input.end),
                {
                    isRequested: Boolean(input.isRequested),
                    promoId: promo?.id ?? null,
                    promoCode: promo?.code ?? null,
                },
            );
            bookings = [...bookings, b];
            return { data: { createBooking: b } };
        }
        case "UpdateBooking": {
            const b = bookings.find((x) => x.id === id);
            if (!b) return notFound("Booking");
            const input = variables!.input as Record<string, unknown>;
            let updated: Booking = {
                ...b,
                ...sent({
                    therapistId: input.therapistId as string | undefined,
                    roomId: input.roomId as string | undefined,
                    serviceId: input.serviceId as string | undefined,
                    start: input.start as string | undefined,
                    end: input.end as string | undefined,
                    isRequested: input.isRequested as boolean | undefined,
                }),
            };
            if (input.clientMobile) {
                const found = clientFor(input);
                if ("error" in found) return { error: found.error };
                updated = {
                    ...updated,
                    client: fullName(found.client),
                    clientId: found.client.id,
                    clientMobile: found.client.mobile,
                };
            }
            if (input.promoCode !== undefined && input.promoCode !== null) {
                const promo = promoFor(input.promoCode);
                if (input.promoCode && !promo)
                    return {
                        error: {
                            message: "That promo code doesn't exist",
                            code: "PROMO_NOT_APPLICABLE",
                        },
                    };
                updated = {
                    ...updated,
                    promoId: promo?.id ?? null,
                    promoCode: promo?.code ?? null,
                };
            }
            bookings = bookings.map((x) => (x.id === id ? updated : x));
            return { data: { updateBooking: updated } };
        }
        case "DeleteBooking": {
            const b = bookings.find((x) => x.id === id);
            if (!b) return notFound("Booking");
            if (b.status === "cancelled")
                return {
                    error: {
                        message: "This booking is already cancelled",
                        code: "BOOKING_CANCELLED",
                    },
                };
            cancel(b.id);
            if (variables?.notifyClient)
                textClient(
                    b,
                    `Hi ${firstName(b)}, your ${whenLabel(b.start)} booking at Kisetsu Spa has been cancelled. To book again, visit https://kisetsuspa.com/book.`,
                );
            return { data: { deleteBooking: true } };
        }
        default:
            return { error: { message: `Mock has no handler for this operation` } };
    }
}

/**
 * A simplified sales report over the mock bookings, in the browser's time zone. The real one
 * is built by the server (src/mods/reports); this only keeps the page usable offline.
 */
function mockSalesReport(variables: Record<string, unknown>): SalesReport {
    const period = variables.period as SalesReport["period"];
    const includeUpcoming = Boolean(variables.includeUpcoming);
    const d = new Date(`${variables.date as string}T00:00:00`);
    let from: Date;
    let to: Date;
    if (period === "daily") {
        from = new Date(d);
        to = new Date(d);
        to.setDate(d.getDate() + 1);
    } else if (period === "weekly") {
        from = new Date(d);
        from.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        to = new Date(from);
        to.setDate(from.getDate() + 7);
    } else if (period === "monthly") {
        from = new Date(d.getFullYear(), d.getMonth(), 1);
        to = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    } else {
        from = new Date(d.getFullYear(), 0, 1);
        to = new Date(d.getFullYear() + 1, 0, 1);
    }
    const hourKey = (date: Date, h = date.getHours()) =>
        `${toDateKey(date)}T${String(h).padStart(2, "0")}`;
    const bucketOf = (date: Date) =>
        period === "daily"
            ? hourKey(date)
            : period === "annual"
              ? toDateKey(date).slice(0, 7)
              : toDateKey(date);
    const keys: string[] = [];
    if (period === "daily") {
        // One bucket per opening hour, 10:00 to 21:00
        for (let h = 10; h < 22; h++) keys.push(hourKey(from, h));
    } else {
        for (const c = new Date(from); c < to;) {
            const key = bucketOf(c);
            if (!keys.includes(key)) keys.push(key);
            if (period === "annual") c.setMonth(c.getMonth() + 1);
            else c.setDate(c.getDate() + 1);
        }
    }
    const series = keys.map((key) => ({ key, bookings: 0, revenue: 0 }));
    type Row = SalesReport["therapists"][number];
    type SvcRow = SalesReport["services"][number];
    type Line = Row["lines"][number];
    const money = () => ({ grossRevenue: 0, discounts: 0, revenue: 0 });
    const rows: Row[] = therapists.map((t) => ({
        therapistId: t.id,
        therapistName: t.name,
        bookings: 0,
        minutes: 0,
        unpriced: 0,
        requested: 0,
        requestRate: 0,
        ...money(),
        services: [],
        lines: [],
    }));
    const svcRows: SvcRow[] = services.map((s) => ({
        serviceId: s.id,
        serviceName: s.name,
        isActive: s.isActive,
        bookings: 0,
        minutes: 0,
        unpriced: 0,
        ...money(),
        lines: [],
    }));
    const totals = { bookings: 0, minutes: 0, unpriced: 0, requested: 0, online: 0, ...money() };
    const unpriced: SalesReport["unpriced"] = [];
    const promoRows = new Map<string, SalesReport["promos"][number]>();
    const clientRows = new Map<string, SalesReport["clients"]["top"][number]>();
    let noClient = 0;
    const nowMs = Date.now();

    const addLine = (
        lines: Line[],
        line: Omit<Line, "bookings" | keyof ReturnType<typeof money>>,
        discount: number,
    ) => {
        let row = lines.find(
            (l) =>
                l.serviceId === line.serviceId &&
                l.durationMin === line.durationMin &&
                l.unitPrice === line.unitPrice,
        );
        if (!row) {
            row = { ...line, bookings: 0, ...money() };
            lines.push(row);
        }
        row.bookings++;
        row.grossRevenue += line.unitPrice;
        row.discounts += discount;
        row.revenue += line.unitPrice - discount;
    };

    let cancelled = 0;
    for (const b of bookings) {
        const start = new Date(b.start);
        const end = Date.parse(b.end);
        if (start < from || start >= to) continue;
        if (b.status === "cancelled") {
            cancelled++;
            continue;
        }
        if (!includeUpcoming && end > nowMs) continue;
        if (b.source === "client") totals.online++;
        const minutes = Math.round((end - start.getTime()) / 60_000);
        const row = rows.find((r) => r.therapistId === b.therapistId);
        const svc = services.find((s) => s.id === b.serviceId);
        const svcRow = svcRows.find((r) => r.serviceId === b.serviceId);
        const bucket = series.find((x) => x.key === bucketOf(start));
        totals.bookings++;
        totals.minutes += minutes;
        if (b.isRequested) totals.requested++;
        if (bucket) bucket.bookings++;
        if (row) {
            row.bookings++;
            row.minutes += minutes;
            if (b.isRequested) row.requested++;
        }
        const client = b.clientId
            ? (clientRows.get(b.clientId) ?? {
                  clientId: b.clientId,
                  name: b.client,
                  mobile: b.clientMobile ?? "",
                  bookings: 0,
                  revenue: 0,
                  totalVisits: active().filter(
                      (x) => x.clientId === b.clientId && Date.parse(x.end) <= nowMs,
                  ).length,
              })
            : null;
        if (client) {
            client.bookings++;
            clientRows.set(client.clientId, client);
        } else noClient++;
        const promo = b.promoId ? promos.find((x) => x.id === b.promoId) : undefined;
        const promoRow = promo
            ? (promoRows.get(promo.id) ?? {
                  promoId: promo.id,
                  code: promo.code,
                  bookings: 0,
                  discounts: 0,
              })
            : undefined;
        if (promo && promoRow) {
            promoRow.bookings++;
            promoRows.set(promo.id, promoRow);
        }

        const rule = svc && findServicePrice(svc.prices, priceDayOf(start), minutes);
        if (svcRow) {
            svcRow.bookings++;
            svcRow.minutes += minutes;
        }
        if (svc && row) {
            const count = row.services.find((c) => c.serviceId === svc.id);
            if (count) count.bookings++;
            else
                row.services.push({
                    serviceId: svc.id,
                    serviceName: svc.name,
                    bookings: 1,
                    revenue: 0,
                });
        }
        if (!svc || !rule) {
            totals.unpriced++;
            if (row) row.unpriced++;
            if (svcRow) svcRow.unpriced++;
            unpriced.push({
                bookingId: b.id,
                client: b.client,
                start: b.start,
                durationMin: minutes,
                therapistName: row?.therapistName ?? "Removed therapist",
                serviceName: svc?.name ?? null,
                reason: svc ? "noPrice" : "noService",
            });
            continue;
        }
        const gross = rule.amount;
        const discount = promo ? promoDiscount(promo, gross) : 0;
        const net = gross - discount;
        for (const target of [totals, row, svcRow]) {
            if (!target) continue;
            target.grossRevenue += gross;
            target.discounts += discount;
            target.revenue += net;
        }
        if (bucket) bucket.revenue += net;
        if (client) client.revenue += net;
        if (promoRow) promoRow.discounts += discount;
        const line = {
            serviceId: svc.id,
            serviceName: svc.name,
            durationMin: minutes,
            unitPrice: gross,
        };
        if (row) addLine(row.lines, line, discount);
        if (svcRow) addLine(svcRow.lines, line, discount);
        const count = row?.services.find((c) => c.serviceId === svc.id);
        if (count) count.revenue += net;
    }

    const r2 = (n: number) => Math.round(n * 100) / 100;
    const last = new Date(to);
    last.setDate(last.getDate() - 1);
    const clientList = [...clientRows.values()];
    const firstBooking = (id: string) =>
        bookings
            .filter((x) => x.clientId === id)
            .map((x) => x.start)
            .sort()[0];
    const newClients = clientList.filter((c) => new Date(firstBooking(c.clientId)) >= from).length;
    return {
        period,
        from: toDateKey(from),
        to: toDateKey(last),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: "PHP",
        includeUpcoming,
        generatedAt: new Date().toISOString(),
        totals: { ...totals, revenue: r2(totals.revenue), discounts: r2(totals.discounts) },
        therapists: rows.map((r) => ({
            ...r,
            revenue: r2(r.revenue),
            discounts: r2(r.discounts),
            requestRate: r.bookings ? r2(r.requested / r.bookings) : 0,
        })),
        services: svcRows
            .filter((s) => s.isActive || s.bookings > 0)
            .map((s) => ({ ...s, revenue: r2(s.revenue), discounts: r2(s.discounts) })),
        series: series.map((b) => ({ ...b, revenue: r2(b.revenue) })),
        unpriced,
        promos: [...promoRows.values()].map((x) => ({ ...x, discounts: r2(x.discounts) })),
        clients: {
            uniqueClients: clientList.length,
            newClients,
            returningClients: clientList.length - newClients,
            noClient,
            top: clientList
                .sort((a, b) => b.bookings - a.bookings || b.revenue - a.revenue)
                .slice(0, 10)
                .map((c) => ({ ...c, revenue: r2(c.revenue) })),
        },
        cancellations: { total: cancelled, byStaff: cancelled, therapistUnavailable: 0 },
    };
}
