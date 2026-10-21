import type { AuthPayload, User } from "@/mods/auth/types";
import type { Booking, Room, Service, Therapist } from "@/mods/schedule/types";
import type { SalesReport } from "@/mods/reports/types";
import { findServicePrice, priceDayOf } from "@/mods/schedule/lib/pricing";
import { toDateKey } from "@/mods/schedule/lib/availability";
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

let bookings: Booking[] = [
    {
        id: "b1",
        client: "Mr. Cruz",
        therapistId: "ana",
        roomId: "room-1",
        serviceId: "haru",
        start: todayAt(15),
        end: todayAt(16, 20),
    },
    {
        id: "b2",
        client: "Ms. Reyes",
        therapistId: "ben",
        roomId: "room-2",
        serviceId: "fuyu",
        start: todayAt(15),
        end: todayAt(16),
    },
    {
        id: "b3",
        client: "Mr. Lim",
        therapistId: "ben",
        roomId: "room-2",
        serviceId: "natsu",
        start: todayAt(16, 30),
        end: todayAt(17, 30),
    },
    {
        id: "b4",
        client: "Mrs. Santos",
        therapistId: "carla",
        roomId: "room-3",
        serviceId: "shiki",
        start: todayAt(15, 30),
        end: todayAt(17, 30),
    },
    {
        id: "b5",
        client: "Ms. Tan",
        therapistId: "dana",
        roomId: "room-4",
        serviceId: "aki",
        start: todayAt(13, 30),
        end: todayAt(14, 30),
    },
];

// A few weeks of past bookings, so reports have something to show
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
        bookings.push({
            id: `past-${day}-${k}`,
            client: `Client ${day}-${k + 1}`,
            therapistId,
            roomId: `room-${(k % 4) + 1}`,
            serviceId,
            start: start.toISOString(),
            end: new Date(start.getTime() + minutes * 60_000).toISOString(),
        });
    }
}

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
    const isAuthOp = ["Login", "Register", "Logout", "Me", "Session"].includes(op);
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
        case "Session":
            if (!token) return { error: { message: "Not authenticated", code: "UNAUTHENTICATED" } };
            // The mock user may do everything, so every action shows up
            return {
                data: {
                    session: {
                        effectivePerms: [
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
        case "SalesReport":
            return { data: { salesReport: mockSalesReport(variables!) } };
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
    const rows = therapists.map((t) => ({
        therapistId: t.id,
        therapistName: t.name,
        bookings: 0,
        minutes: 0,
        revenue: 0,
        unpriced: 0,
        services: [] as SalesReport["therapists"][number]["services"],
        lines: [] as SalesReport["therapists"][number]["lines"],
    }));
    const svcRows = services.map((s) => ({
        serviceId: s.id,
        serviceName: s.name,
        isActive: s.isActive,
        bookings: 0,
        minutes: 0,
        revenue: 0,
        unpriced: 0,
        lines: [] as SalesReport["services"][number]["lines"],
    }));
    const totals = { bookings: 0, minutes: 0, revenue: 0, unpriced: 0 };
    const unpriced: SalesReport["unpriced"] = [];
    const now = Date.now();

    for (const b of bookings) {
        const start = new Date(b.start);
        const end = Date.parse(b.end);
        if (start < from || start >= to || (!includeUpcoming && end > now)) continue;
        const minutes = Math.round((end - start.getTime()) / 60_000);
        const row = rows.find((r) => r.therapistId === b.therapistId);
        const svc = services.find((s) => s.id === b.serviceId);
        const svcRow = svcRows.find((r) => r.serviceId === b.serviceId);
        const bucket = series.find((x) => x.key === bucketOf(start));
        totals.bookings++;
        totals.minutes += minutes;
        if (bucket) bucket.bookings++;
        if (row) {
            row.bookings++;
            row.minutes += minutes;
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
        const amount = rule.amount;
        totals.revenue += amount;
        if (bucket) bucket.revenue += amount;
        for (const target of [row, svcRow]) {
            if (!target) continue;
            target.revenue += amount;
            const line = target.lines.find(
                (l) =>
                    l.serviceId === svc.id && l.durationMin === minutes && l.unitPrice === amount,
            );
            if (line) {
                line.bookings++;
                line.revenue += amount;
            } else
                target.lines.push({
                    serviceId: svc.id,
                    serviceName: svc.name,
                    durationMin: minutes,
                    unitPrice: amount,
                    bookings: 1,
                    revenue: amount,
                });
        }
        const count = row?.services.find((c) => c.serviceId === svc.id);
        if (count) count.revenue += amount;
    }

    const last = new Date(to);
    last.setDate(last.getDate() - 1);
    return {
        period,
        from: toDateKey(from),
        to: toDateKey(last),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: "PHP",
        includeUpcoming,
        generatedAt: new Date().toISOString(),
        totals,
        therapists: rows,
        services: svcRows.filter((s) => s.isActive || s.bookings > 0),
        series,
        unpriced,
    };
}
