/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
    T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type BookingSource =
    /** Made by the client on the booking site */
    | "client"
    /** Made in the scheduling app */
    | "staff";

export type BookingStatus = "booked" | "cancelled";

export type CreateBookingInput = {
    /** Required when the mobile is new */
    clientFirstName?: string | null | undefined;
    clientLastName?: string | null | undefined;
    /** Any Philippine mobile format (0917 123 4567, +63 917…) or +<country code>…. Finds the client, or creates them when the number is new */
    clientMobile: string;
    end: string;
    isRequested?: boolean | null | undefined;
    /** One promo per booking; case doesn’t matter */
    promoCode?: string | null | undefined;
    roomId: string | number;
    /** Must have a price for the booking length on its date */
    serviceId: string | number;
    start: string;
    therapistId: string | number;
};

export type CreatePromoInput = {
    code: string;
    description?: string | null | undefined;
    discountType: DiscountType;
    isActive?: boolean | null | undefined;
    serviceIds?: Array<string | number> | null | undefined;
    validFrom: string;
    validTo?: string | null | undefined;
    value: number;
};

export type CreateRoomInput = {
    color: string;
    name: string;
};

export type CreateServiceInput = {
    description?: string | null | undefined;
    isActive?: boolean | null | undefined;
    name: string;
    prices: Array<ServicePriceInput>;
};

export type CreateTherapistInput = {
    leaveDates?: Array<string> | null | undefined;
    name: string;
    offDays?: Array<number> | null | undefined;
};

/** percent = value % off the price; amount = value pesos off (capped at the price) */
export type DiscountType = "amount" | "percent";

export type LoginInput = {
    email: string;
    password: string;
};

/** Granular permissions. Admin permissions (superAdmin, readUsers, manageUserAccess, readRoles, manageRoles, logoutUsers, impersonateUsers, readAuditLogs) only apply through an admin-kind role; superAdmin implies every permission. */
export type Permission =
    | "createBooking"
    | "createExample"
    | "createPromo"
    | "createRoom"
    | "createService"
    | "createTherapist"
    | "deleteBooking"
    | "deleteExample"
    | "deletePromo"
    | "deleteRoom"
    | "deleteService"
    | "deleteTherapist"
    | "impersonateUsers"
    | "logoutUsers"
    | "manageRoles"
    | "manageUserAccess"
    | "readAuditLogs"
    | "readClients"
    | "readReports"
    | "readRoles"
    | "readSmsLogs"
    | "readUsers"
    | "resetTwoFactor"
    | "superAdmin"
    | "updateBooking"
    | "updateClient"
    | "updateExample"
    | "updatePromo"
    | "updateRoom"
    | "updateService"
    | "updateTherapist";

export type RegisterInput = {
    /** Normalised to lowercase */
    email: string;
    name: string;
    /** 8-72 characters */
    password: string;
};

/** daily (charted per hour); weekly = Monday to Sunday; monthly; annual. Dates in SCHEDULE_TIMEZONE */
export type ReportPeriod = "annual" | "daily" | "monthly" | "weekly";

export type ServicePriceInput = {
    amount: number;
    /** Weekdays (0 = Sunday); leave out for every day */
    days?: Array<number> | null | undefined;
    /** Minutes; leave out for any length */
    durationMin?: number | null | undefined;
    /** "YYYY-MM-DD" */
    validFrom: string;
    /** "YYYY-MM-DD"; leave out while current */
    validTo?: string | null | undefined;
};

export type SmsPurpose = "rebook" | "setupCode";

export type SmsStatus = "failed" | "sending" | "sent";

/** noService = booking has no service; noPrice = no price rule for its date/length */
export type UnpricedReason = "noPrice" | "noService";

/** Only the fields you send are changed; the result must still pass every rule */
export type UpdateBookingInput = {
    /** Used only when the mobile is new */
    clientFirstName?: string | null | undefined;
    clientLastName?: string | null | undefined;
    /** Re-links the booking to this client */
    clientMobile?: string | null | undefined;
    end?: string | null | undefined;
    isRequested?: boolean | null | undefined;
    /** "" removes the promo */
    promoCode?: string | null | undefined;
    roomId?: string | number | null | undefined;
    serviceId?: string | number | null | undefined;
    start?: string | null | undefined;
    therapistId?: string | number | null | undefined;
};

/** Only the fields you send are changed; bookings show the new name and mobile */
export type UpdateClientInput = {
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    mobile?: string | null | undefined;
    notes?: string | null | undefined;
};

/** Only the fields you send change; validTo: null removes the end date. Once used, code, discountType, value and serviceIds can no longer change (PROMO_LOCKED). */
export type UpdatePromoInput = {
    code?: string | null | undefined;
    description?: string | null | undefined;
    discountType?: DiscountType | null | undefined;
    isActive?: boolean | null | undefined;
    serviceIds?: Array<string | number> | null | undefined;
    validFrom?: string | null | undefined;
    validTo?: string | null | undefined;
    value?: number | null | undefined;
};

/** Only the fields you send are changed */
export type UpdateRoomInput = {
    color?: string | null | undefined;
    name?: string | null | undefined;
};

/** Only the fields you send are changed; `prices` replaces the whole price list */
export type UpdateServiceInput = {
    description?: string | null | undefined;
    isActive?: boolean | null | undefined;
    name?: string | null | undefined;
    prices?: Array<ServicePriceInput> | null | undefined;
};

/** Only the fields you send are changed; lists replace the stored list */
export type UpdateTherapistInput = {
    leaveDates?: Array<string> | null | undefined;
    name?: string | null | undefined;
    offDays?: Array<number> | null | undefined;
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
            twoFactorEnabled: boolean;
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
        token: string | null;
        twoFactorRequired: boolean;
        twoFactorSetupRequired: boolean;
        challengeToken: string | null;
        user: {
            id: string;
            name: string;
            email: string;
            extraPerms: Array<Permission>;
            twoFactorEnabled: boolean;
            createdAt: string;
            role: { id: string; name: string };
        } | null;
    };
};

export type LoginTwoFactorMutationVariables = Exact<{
    challengeToken: string;
    code: string;
}>;

export type LoginTwoFactorMutation = {
    loginTwoFactor: {
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            extraPerms: Array<Permission>;
            twoFactorEnabled: boolean;
            createdAt: string;
            role: { id: string; name: string };
        };
    };
};

export type SetupTwoFactorMutationVariables = Exact<{
    challengeToken?: string | null | undefined;
}>;

export type SetupTwoFactorMutation = {
    setupTwoFactor: { secret: string; otpauthUrl: string; qrDataUrl: string };
};

export type ConfirmTwoFactorMutationVariables = Exact<{
    code: string;
    challengeToken?: string | null | undefined;
}>;

export type ConfirmTwoFactorMutation = {
    confirmTwoFactor: {
        token: string;
        recoveryCodes: Array<string>;
        user: {
            id: string;
            name: string;
            email: string;
            extraPerms: Array<Permission>;
            twoFactorEnabled: boolean;
            createdAt: string;
            role: { id: string; name: string };
        };
    };
};

export type DisableTwoFactorMutationVariables = Exact<{
    password: string;
    code: string;
}>;

export type DisableTwoFactorMutation = { disableTwoFactor: boolean };

export type RegenerateRecoveryCodesMutationVariables = Exact<{
    code: string;
}>;

export type RegenerateRecoveryCodesMutation = { regenerateRecoveryCodes: Array<string> };

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { logout: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
    me: {
        id: string;
        name: string;
        email: string;
        extraPerms: Array<Permission>;
        twoFactorEnabled: boolean;
        createdAt: string;
        role: { id: string; name: string };
    };
};

export type SessionQueryVariables = Exact<{ [key: string]: never }>;

export type SessionQuery = {
    session: { effectivePerms: Array<Permission>; twoFactorRequired: boolean };
};

export type ClientFieldsFragment = {
    id: string;
    mobile: string;
    firstName: string;
    lastName: string;
    fullName: string;
    notes: string;
    appEnabledAt: string | null;
    createdAt: string;
    stats: {
        visits: number;
        upcoming: number;
        firstVisit: string | null;
        lastVisit: string | null;
        requested: number;
        favouriteTherapistId: string | null;
        favouriteTherapistName: string | null;
    };
};

export type ClientsQueryVariables = Exact<{
    search?: string | null | undefined;
    page?: number | null | undefined;
    limit?: number | null | undefined;
}>;

export type ClientsQuery = {
    clients: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        data: Array<{
            id: string;
            mobile: string;
            firstName: string;
            lastName: string;
            fullName: string;
            notes: string;
            appEnabledAt: string | null;
            createdAt: string;
            stats: {
                visits: number;
                upcoming: number;
                firstVisit: string | null;
                lastVisit: string | null;
                requested: number;
                favouriteTherapistId: string | null;
                favouriteTherapistName: string | null;
            };
        }>;
    };
};

export type ClientByMobileQueryVariables = Exact<{
    mobile: string;
}>;

export type ClientByMobileQuery = {
    clientByMobile: {
        id: string;
        mobile: string;
        firstName: string;
        lastName: string;
        fullName: string;
        notes: string;
        appEnabledAt: string | null;
        createdAt: string;
        stats: {
            visits: number;
            upcoming: number;
            firstVisit: string | null;
            lastVisit: string | null;
            requested: number;
            favouriteTherapistId: string | null;
            favouriteTherapistName: string | null;
        };
    } | null;
};

export type ClientBookingsQueryVariables = Exact<{
    clientId: string | number;
    limit?: number | null | undefined;
}>;

export type ClientBookingsQuery = {
    clientBookings: Array<{
        id: string;
        client: string;
        clientId: string | null;
        clientMobile: string | null;
        isRequested: boolean;
        promoId: string | null;
        promoCode: string | null;
        therapistId: string;
        roomId: string;
        serviceId: string | null;
        start: string;
        end: string;
        status: BookingStatus;
        source: BookingSource;
    }>;
};

export type UpdateClientMutationVariables = Exact<{
    id: string | number;
    input: UpdateClientInput;
}>;

export type UpdateClientMutation = {
    updateClient: {
        id: string;
        mobile: string;
        firstName: string;
        lastName: string;
        fullName: string;
        notes: string;
        appEnabledAt: string | null;
        createdAt: string;
        stats: {
            visits: number;
            upcoming: number;
            firstVisit: string | null;
            lastVisit: string | null;
            requested: number;
            favouriteTherapistId: string | null;
            favouriteTherapistName: string | null;
        };
    };
};

export type ResetClientAppMutationVariables = Exact<{
    id: string | number;
}>;

export type ResetClientAppMutation = {
    resetClientApp: {
        id: string;
        mobile: string;
        firstName: string;
        lastName: string;
        fullName: string;
        notes: string;
        appEnabledAt: string | null;
        createdAt: string;
        stats: {
            visits: number;
            upcoming: number;
            firstVisit: string | null;
            lastVisit: string | null;
            requested: number;
            favouriteTherapistId: string | null;
            favouriteTherapistName: string | null;
        };
    };
};

export type SalesLineFieldsFragment = {
    serviceId: string;
    serviceName: string;
    durationMin: number;
    unitPrice: number;
    bookings: number;
    grossRevenue: number;
    discounts: number;
    revenue: number;
};

export type SalesReportQueryVariables = Exact<{
    period: ReportPeriod;
    date: string;
    includeUpcoming?: boolean | null | undefined;
}>;

export type SalesReportQuery = {
    salesReport: {
        period: ReportPeriod;
        from: string;
        to: string;
        timeZone: string;
        currency: string;
        includeUpcoming: boolean;
        generatedAt: string;
        totals: {
            bookings: number;
            minutes: number;
            grossRevenue: number;
            discounts: number;
            revenue: number;
            unpriced: number;
            requested: number;
            online: number;
        };
        cancellations: { total: number; byStaff: number; therapistUnavailable: number };
        therapists: Array<{
            therapistId: string;
            therapistName: string;
            bookings: number;
            minutes: number;
            grossRevenue: number;
            discounts: number;
            revenue: number;
            unpriced: number;
            requested: number;
            requestRate: number;
            services: Array<{
                serviceId: string;
                serviceName: string;
                bookings: number;
                revenue: number;
            }>;
            lines: Array<{
                serviceId: string;
                serviceName: string;
                durationMin: number;
                unitPrice: number;
                bookings: number;
                grossRevenue: number;
                discounts: number;
                revenue: number;
            }>;
        }>;
        services: Array<{
            serviceId: string;
            serviceName: string;
            isActive: boolean;
            bookings: number;
            minutes: number;
            grossRevenue: number;
            discounts: number;
            revenue: number;
            unpriced: number;
            lines: Array<{
                serviceId: string;
                serviceName: string;
                durationMin: number;
                unitPrice: number;
                bookings: number;
                grossRevenue: number;
                discounts: number;
                revenue: number;
            }>;
        }>;
        series: Array<{ key: string; bookings: number; revenue: number }>;
        unpriced: Array<{
            bookingId: string;
            client: string;
            start: string;
            durationMin: number;
            therapistName: string;
            serviceName: string | null;
            reason: UnpricedReason;
        }>;
        promos: Array<{ promoId: string; code: string; bookings: number; discounts: number }>;
        clients: {
            uniqueClients: number;
            newClients: number;
            returningClients: number;
            noClient: number;
            top: Array<{
                clientId: string;
                name: string;
                mobile: string;
                bookings: number;
                revenue: number;
                totalVisits: number;
            }>;
        };
    };
};

export type BookingsQueryVariables = Exact<{
    from: string;
    to: string;
}>;

export type BookingsQuery = {
    bookings: Array<{
        id: string;
        client: string;
        clientId: string | null;
        clientMobile: string | null;
        isRequested: boolean;
        promoId: string | null;
        promoCode: string | null;
        therapistId: string;
        roomId: string;
        serviceId: string | null;
        start: string;
        end: string;
        status: BookingStatus;
        source: BookingSource;
    }>;
};

export type CreateBookingMutationVariables = Exact<{
    input: CreateBookingInput;
}>;

export type CreateBookingMutation = {
    createBooking: {
        id: string;
        client: string;
        clientId: string | null;
        clientMobile: string | null;
        isRequested: boolean;
        promoId: string | null;
        promoCode: string | null;
        therapistId: string;
        roomId: string;
        serviceId: string | null;
        start: string;
        end: string;
        status: BookingStatus;
        source: BookingSource;
    };
};

export type UpdateBookingMutationVariables = Exact<{
    id: string | number;
    input: UpdateBookingInput;
}>;

export type UpdateBookingMutation = {
    updateBooking: {
        id: string;
        client: string;
        clientId: string | null;
        clientMobile: string | null;
        isRequested: boolean;
        promoId: string | null;
        promoCode: string | null;
        therapistId: string;
        roomId: string;
        serviceId: string | null;
        start: string;
        end: string;
        status: BookingStatus;
        source: BookingSource;
    };
};

export type DeleteBookingMutationVariables = Exact<{
    id: string | number;
    notifyClient?: boolean | null | undefined;
}>;

export type DeleteBookingMutation = { deleteBooking: boolean };

export type PromosQueryVariables = Exact<{
    includeArchived?: boolean | null | undefined;
}>;

export type PromosQuery = {
    promos: Array<{
        id: string;
        code: string;
        description: string;
        discountType: DiscountType;
        value: number;
        validFrom: string;
        validTo: string | null;
        serviceIds: Array<string>;
        isActive: boolean;
        timesUsed: number;
        isLocked: boolean;
    }>;
};

export type CreatePromoMutationVariables = Exact<{
    input: CreatePromoInput;
}>;

export type CreatePromoMutation = {
    createPromo: {
        id: string;
        code: string;
        description: string;
        discountType: DiscountType;
        value: number;
        validFrom: string;
        validTo: string | null;
        serviceIds: Array<string>;
        isActive: boolean;
        timesUsed: number;
        isLocked: boolean;
    };
};

export type UpdatePromoMutationVariables = Exact<{
    id: string | number;
    input: UpdatePromoInput;
}>;

export type UpdatePromoMutation = {
    updatePromo: {
        id: string;
        code: string;
        description: string;
        discountType: DiscountType;
        value: number;
        validFrom: string;
        validTo: string | null;
        serviceIds: Array<string>;
        isActive: boolean;
        timesUsed: number;
        isLocked: boolean;
    };
};

export type DeletePromoMutationVariables = Exact<{
    id: string | number;
}>;

export type DeletePromoMutation = { deletePromo: boolean };

export type RoomsQueryVariables = Exact<{ [key: string]: never }>;

export type RoomsQuery = { rooms: Array<{ id: string; name: string; color: string }> };

export type CreateRoomMutationVariables = Exact<{
    input: CreateRoomInput;
}>;

export type CreateRoomMutation = { createRoom: { id: string; name: string; color: string } };

export type UpdateRoomMutationVariables = Exact<{
    id: string | number;
    input: UpdateRoomInput;
}>;

export type UpdateRoomMutation = { updateRoom: { id: string; name: string; color: string } };

export type DeleteRoomMutationVariables = Exact<{
    id: string | number;
}>;

export type DeleteRoomMutation = { deleteRoom: boolean };

export type TherapistFieldsFragment = {
    id: string;
    name: string;
    offDays: Array<number>;
    leaveDates: Array<string>;
};

export type RoomFieldsFragment = { id: string; name: string; color: string };

export type BookingFieldsFragment = {
    id: string;
    client: string;
    clientId: string | null;
    clientMobile: string | null;
    isRequested: boolean;
    promoId: string | null;
    promoCode: string | null;
    therapistId: string;
    roomId: string;
    serviceId: string | null;
    start: string;
    end: string;
    status: BookingStatus;
    source: BookingSource;
};

export type PromoFieldsFragment = {
    id: string;
    code: string;
    description: string;
    discountType: DiscountType;
    value: number;
    validFrom: string;
    validTo: string | null;
    serviceIds: Array<string>;
    isActive: boolean;
    timesUsed: number;
    isLocked: boolean;
};

export type ServicePriceFieldsFragment = {
    id: string;
    durationMin: number | null;
    days: Array<number>;
    amount: number;
    validFrom: string;
    validTo: string | null;
};

export type ServiceFieldsFragment = {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    prices: Array<{
        id: string;
        durationMin: number | null;
        days: Array<number>;
        amount: number;
        validFrom: string;
        validTo: string | null;
    }>;
};

export type ServicesQueryVariables = Exact<{
    includeArchived?: boolean | null | undefined;
}>;

export type ServicesQuery = {
    services: Array<{
        id: string;
        name: string;
        description: string;
        isActive: boolean;
        prices: Array<{
            id: string;
            durationMin: number | null;
            days: Array<number>;
            amount: number;
            validFrom: string;
            validTo: string | null;
        }>;
    }>;
};

export type CreateServiceMutationVariables = Exact<{
    input: CreateServiceInput;
}>;

export type CreateServiceMutation = {
    createService: {
        id: string;
        name: string;
        description: string;
        isActive: boolean;
        prices: Array<{
            id: string;
            durationMin: number | null;
            days: Array<number>;
            amount: number;
            validFrom: string;
            validTo: string | null;
        }>;
    };
};

export type UpdateServiceMutationVariables = Exact<{
    id: string | number;
    input: UpdateServiceInput;
}>;

export type UpdateServiceMutation = {
    updateService: {
        id: string;
        name: string;
        description: string;
        isActive: boolean;
        prices: Array<{
            id: string;
            durationMin: number | null;
            days: Array<number>;
            amount: number;
            validFrom: string;
            validTo: string | null;
        }>;
    };
};

export type DeleteServiceMutationVariables = Exact<{
    id: string | number;
}>;

export type DeleteServiceMutation = { deleteService: boolean };

export type TherapistsQueryVariables = Exact<{ [key: string]: never }>;

export type TherapistsQuery = {
    therapists: Array<{
        id: string;
        name: string;
        offDays: Array<number>;
        leaveDates: Array<string>;
    }>;
};

export type CreateTherapistMutationVariables = Exact<{
    input: CreateTherapistInput;
}>;

export type CreateTherapistMutation = {
    createTherapist: {
        id: string;
        name: string;
        offDays: Array<number>;
        leaveDates: Array<string>;
    };
};

export type UpdateTherapistMutationVariables = Exact<{
    id: string | number;
    input: UpdateTherapistInput;
}>;

export type UpdateTherapistMutation = {
    updateTherapist: {
        id: string;
        name: string;
        offDays: Array<number>;
        leaveDates: Array<string>;
    };
};

export type DeleteTherapistMutationVariables = Exact<{
    id: string | number;
}>;

export type DeleteTherapistMutation = { deleteTherapist: boolean };

export type TherapistConflictsQueryVariables = Exact<{
    id: string | number;
    offDays?: Array<number> | number | null | undefined;
    leaveDates?: Array<string> | string | null | undefined;
}>;

export type TherapistConflictsQuery = {
    therapistConflicts: Array<{
        id: string;
        client: string;
        clientId: string | null;
        clientMobile: string | null;
        isRequested: boolean;
        promoId: string | null;
        promoCode: string | null;
        therapistId: string;
        roomId: string;
        serviceId: string | null;
        start: string;
        end: string;
        status: BookingStatus;
        source: BookingSource;
    }>;
};

export type SmsLogsQueryVariables = Exact<{
    status?: SmsStatus | null | undefined;
    limit?: number | null | undefined;
}>;

export type SmsLogsQuery = {
    smsLogs: Array<{
        id: string;
        to: string;
        purpose: SmsPurpose;
        message: string;
        status: SmsStatus;
        attempts: number;
        error: string | null;
        bookingId: string | null;
        clientId: string | null;
        createdAt: string;
        sentAt: string | null;
    }>;
};

export type UserFieldsFragment = {
    id: string;
    name: string;
    email: string;
    extraPerms: Array<Permission>;
    twoFactorEnabled: boolean;
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
            twoFactorEnabled: boolean;
            createdAt: string;
            role: { id: string; name: string };
        }>;
    };
};

export type ResetUserTwoFactorMutationVariables = Exact<{
    userId: string | number;
}>;

export type ResetUserTwoFactorMutation = { resetUserTwoFactor: boolean };

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
export const ClientFieldsFragmentDoc = new TypedDocumentString(
    `
    fragment ClientFields on Client {
  id
  mobile
  firstName
  lastName
  fullName
  notes
  appEnabledAt
  createdAt
  stats {
    visits
    upcoming
    firstVisit
    lastVisit
    requested
    favouriteTherapistId
    favouriteTherapistName
  }
}
    `,
    { fragmentName: "ClientFields" },
) as unknown as TypedDocumentString<ClientFieldsFragment, unknown>;
export const SalesLineFieldsFragmentDoc = new TypedDocumentString(
    `
    fragment SalesLineFields on SalesLine {
  serviceId
  serviceName
  durationMin
  unitPrice
  bookings
  grossRevenue
  discounts
  revenue
}
    `,
    { fragmentName: "SalesLineFields" },
) as unknown as TypedDocumentString<SalesLineFieldsFragment, unknown>;
export const TherapistFieldsFragmentDoc = new TypedDocumentString(
    `
    fragment TherapistFields on Therapist {
  id
  name
  offDays
  leaveDates
}
    `,
    { fragmentName: "TherapistFields" },
) as unknown as TypedDocumentString<TherapistFieldsFragment, unknown>;
export const RoomFieldsFragmentDoc = new TypedDocumentString(
    `
    fragment RoomFields on Room {
  id
  name
  color
}
    `,
    { fragmentName: "RoomFields" },
) as unknown as TypedDocumentString<RoomFieldsFragment, unknown>;
export const BookingFieldsFragmentDoc = new TypedDocumentString(
    `
    fragment BookingFields on Booking {
  id
  client
  clientId
  clientMobile
  isRequested
  promoId
  promoCode
  therapistId
  roomId
  serviceId
  start
  end
  status
  source
}
    `,
    { fragmentName: "BookingFields" },
) as unknown as TypedDocumentString<BookingFieldsFragment, unknown>;
export const PromoFieldsFragmentDoc = new TypedDocumentString(
    `
    fragment PromoFields on Promo {
  id
  code
  description
  discountType
  value
  validFrom
  validTo
  serviceIds
  isActive
  timesUsed
  isLocked
}
    `,
    { fragmentName: "PromoFields" },
) as unknown as TypedDocumentString<PromoFieldsFragment, unknown>;
export const ServicePriceFieldsFragmentDoc = new TypedDocumentString(
    `
    fragment ServicePriceFields on ServicePrice {
  id
  durationMin
  days
  amount
  validFrom
  validTo
}
    `,
    { fragmentName: "ServicePriceFields" },
) as unknown as TypedDocumentString<ServicePriceFieldsFragment, unknown>;
export const ServiceFieldsFragmentDoc = new TypedDocumentString(
    `
    fragment ServiceFields on Service {
  id
  name
  description
  isActive
  prices {
    ...ServicePriceFields
  }
}
    fragment ServicePriceFields on ServicePrice {
  id
  durationMin
  days
  amount
  validFrom
  validTo
}`,
    { fragmentName: "ServiceFields" },
) as unknown as TypedDocumentString<ServiceFieldsFragment, unknown>;
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
  twoFactorEnabled
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
  twoFactorEnabled
  createdAt
}`) as unknown as TypedDocumentString<RegisterMutation, RegisterMutationVariables>;
export const LoginDocument = new TypedDocumentString(`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      ...UserFields
    }
    twoFactorRequired
    twoFactorSetupRequired
    challengeToken
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
  twoFactorEnabled
  createdAt
}`) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const LoginTwoFactorDocument = new TypedDocumentString(`
    mutation LoginTwoFactor($challengeToken: String!, $code: String!) {
  loginTwoFactor(challengeToken: $challengeToken, code: $code) {
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
  twoFactorEnabled
  createdAt
}`) as unknown as TypedDocumentString<LoginTwoFactorMutation, LoginTwoFactorMutationVariables>;
export const SetupTwoFactorDocument = new TypedDocumentString(`
    mutation SetupTwoFactor($challengeToken: String) {
  setupTwoFactor(challengeToken: $challengeToken) {
    secret
    otpauthUrl
    qrDataUrl
  }
}
    `) as unknown as TypedDocumentString<SetupTwoFactorMutation, SetupTwoFactorMutationVariables>;
export const ConfirmTwoFactorDocument = new TypedDocumentString(`
    mutation ConfirmTwoFactor($code: String!, $challengeToken: String) {
  confirmTwoFactor(code: $code, challengeToken: $challengeToken) {
    token
    recoveryCodes
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
  twoFactorEnabled
  createdAt
}`) as unknown as TypedDocumentString<ConfirmTwoFactorMutation, ConfirmTwoFactorMutationVariables>;
export const DisableTwoFactorDocument = new TypedDocumentString(`
    mutation DisableTwoFactor($password: String!, $code: String!) {
  disableTwoFactor(password: $password, code: $code)
}
    `) as unknown as TypedDocumentString<
    DisableTwoFactorMutation,
    DisableTwoFactorMutationVariables
>;
export const RegenerateRecoveryCodesDocument = new TypedDocumentString(`
    mutation RegenerateRecoveryCodes($code: String!) {
  regenerateRecoveryCodes(code: $code)
}
    `) as unknown as TypedDocumentString<
    RegenerateRecoveryCodesMutation,
    RegenerateRecoveryCodesMutationVariables
>;
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
  twoFactorEnabled
  createdAt
}`) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const SessionDocument = new TypedDocumentString(`
    query Session {
  session {
    effectivePerms
    twoFactorRequired
  }
}
    `) as unknown as TypedDocumentString<SessionQuery, SessionQueryVariables>;
export const ClientsDocument = new TypedDocumentString(`
    query Clients($search: String, $page: Int, $limit: Int) {
  clients(search: $search, page: $page, limit: $limit) {
    data {
      ...ClientFields
    }
    page
    limit
    total
    totalPages
  }
}
    fragment ClientFields on Client {
  id
  mobile
  firstName
  lastName
  fullName
  notes
  appEnabledAt
  createdAt
  stats {
    visits
    upcoming
    firstVisit
    lastVisit
    requested
    favouriteTherapistId
    favouriteTherapistName
  }
}`) as unknown as TypedDocumentString<ClientsQuery, ClientsQueryVariables>;
export const ClientByMobileDocument = new TypedDocumentString(`
    query ClientByMobile($mobile: String!) {
  clientByMobile(mobile: $mobile) {
    ...ClientFields
  }
}
    fragment ClientFields on Client {
  id
  mobile
  firstName
  lastName
  fullName
  notes
  appEnabledAt
  createdAt
  stats {
    visits
    upcoming
    firstVisit
    lastVisit
    requested
    favouriteTherapistId
    favouriteTherapistName
  }
}`) as unknown as TypedDocumentString<ClientByMobileQuery, ClientByMobileQueryVariables>;
export const ClientBookingsDocument = new TypedDocumentString(`
    query ClientBookings($clientId: ID!, $limit: Int) {
  clientBookings(clientId: $clientId, limit: $limit) {
    ...BookingFields
  }
}
    fragment BookingFields on Booking {
  id
  client
  clientId
  clientMobile
  isRequested
  promoId
  promoCode
  therapistId
  roomId
  serviceId
  start
  end
  status
  source
}`) as unknown as TypedDocumentString<ClientBookingsQuery, ClientBookingsQueryVariables>;
export const UpdateClientDocument = new TypedDocumentString(`
    mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
  updateClient(id: $id, input: $input) {
    ...ClientFields
  }
}
    fragment ClientFields on Client {
  id
  mobile
  firstName
  lastName
  fullName
  notes
  appEnabledAt
  createdAt
  stats {
    visits
    upcoming
    firstVisit
    lastVisit
    requested
    favouriteTherapistId
    favouriteTherapistName
  }
}`) as unknown as TypedDocumentString<UpdateClientMutation, UpdateClientMutationVariables>;
export const ResetClientAppDocument = new TypedDocumentString(`
    mutation ResetClientApp($id: ID!) {
  resetClientApp(id: $id) {
    ...ClientFields
  }
}
    fragment ClientFields on Client {
  id
  mobile
  firstName
  lastName
  fullName
  notes
  appEnabledAt
  createdAt
  stats {
    visits
    upcoming
    firstVisit
    lastVisit
    requested
    favouriteTherapistId
    favouriteTherapistName
  }
}`) as unknown as TypedDocumentString<ResetClientAppMutation, ResetClientAppMutationVariables>;
export const SalesReportDocument = new TypedDocumentString(`
    query SalesReport($period: ReportPeriod!, $date: String!, $includeUpcoming: Boolean) {
  salesReport(period: $period, date: $date, includeUpcoming: $includeUpcoming) {
    period
    from
    to
    timeZone
    currency
    includeUpcoming
    generatedAt
    totals {
      bookings
      minutes
      grossRevenue
      discounts
      revenue
      unpriced
      requested
      online
    }
    cancellations {
      total
      byStaff
      therapistUnavailable
    }
    therapists {
      therapistId
      therapistName
      bookings
      minutes
      grossRevenue
      discounts
      revenue
      unpriced
      requested
      requestRate
      services {
        serviceId
        serviceName
        bookings
        revenue
      }
      lines {
        ...SalesLineFields
      }
    }
    services {
      serviceId
      serviceName
      isActive
      bookings
      minutes
      grossRevenue
      discounts
      revenue
      unpriced
      lines {
        ...SalesLineFields
      }
    }
    series {
      key
      bookings
      revenue
    }
    unpriced {
      bookingId
      client
      start
      durationMin
      therapistName
      serviceName
      reason
    }
    promos {
      promoId
      code
      bookings
      discounts
    }
    clients {
      uniqueClients
      newClients
      returningClients
      noClient
      top {
        clientId
        name
        mobile
        bookings
        revenue
        totalVisits
      }
    }
  }
}
    fragment SalesLineFields on SalesLine {
  serviceId
  serviceName
  durationMin
  unitPrice
  bookings
  grossRevenue
  discounts
  revenue
}`) as unknown as TypedDocumentString<SalesReportQuery, SalesReportQueryVariables>;
export const BookingsDocument = new TypedDocumentString(`
    query Bookings($from: DateTime!, $to: DateTime!) {
  bookings(from: $from, to: $to) {
    ...BookingFields
  }
}
    fragment BookingFields on Booking {
  id
  client
  clientId
  clientMobile
  isRequested
  promoId
  promoCode
  therapistId
  roomId
  serviceId
  start
  end
  status
  source
}`) as unknown as TypedDocumentString<BookingsQuery, BookingsQueryVariables>;
export const CreateBookingDocument = new TypedDocumentString(`
    mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    ...BookingFields
  }
}
    fragment BookingFields on Booking {
  id
  client
  clientId
  clientMobile
  isRequested
  promoId
  promoCode
  therapistId
  roomId
  serviceId
  start
  end
  status
  source
}`) as unknown as TypedDocumentString<CreateBookingMutation, CreateBookingMutationVariables>;
export const UpdateBookingDocument = new TypedDocumentString(`
    mutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {
  updateBooking(id: $id, input: $input) {
    ...BookingFields
  }
}
    fragment BookingFields on Booking {
  id
  client
  clientId
  clientMobile
  isRequested
  promoId
  promoCode
  therapistId
  roomId
  serviceId
  start
  end
  status
  source
}`) as unknown as TypedDocumentString<UpdateBookingMutation, UpdateBookingMutationVariables>;
export const DeleteBookingDocument = new TypedDocumentString(`
    mutation DeleteBooking($id: ID!, $notifyClient: Boolean) {
  deleteBooking(id: $id, notifyClient: $notifyClient)
}
    `) as unknown as TypedDocumentString<DeleteBookingMutation, DeleteBookingMutationVariables>;
export const PromosDocument = new TypedDocumentString(`
    query Promos($includeArchived: Boolean) {
  promos(includeArchived: $includeArchived) {
    ...PromoFields
  }
}
    fragment PromoFields on Promo {
  id
  code
  description
  discountType
  value
  validFrom
  validTo
  serviceIds
  isActive
  timesUsed
  isLocked
}`) as unknown as TypedDocumentString<PromosQuery, PromosQueryVariables>;
export const CreatePromoDocument = new TypedDocumentString(`
    mutation CreatePromo($input: CreatePromoInput!) {
  createPromo(input: $input) {
    ...PromoFields
  }
}
    fragment PromoFields on Promo {
  id
  code
  description
  discountType
  value
  validFrom
  validTo
  serviceIds
  isActive
  timesUsed
  isLocked
}`) as unknown as TypedDocumentString<CreatePromoMutation, CreatePromoMutationVariables>;
export const UpdatePromoDocument = new TypedDocumentString(`
    mutation UpdatePromo($id: ID!, $input: UpdatePromoInput!) {
  updatePromo(id: $id, input: $input) {
    ...PromoFields
  }
}
    fragment PromoFields on Promo {
  id
  code
  description
  discountType
  value
  validFrom
  validTo
  serviceIds
  isActive
  timesUsed
  isLocked
}`) as unknown as TypedDocumentString<UpdatePromoMutation, UpdatePromoMutationVariables>;
export const DeletePromoDocument = new TypedDocumentString(`
    mutation DeletePromo($id: ID!) {
  deletePromo(id: $id)
}
    `) as unknown as TypedDocumentString<DeletePromoMutation, DeletePromoMutationVariables>;
export const RoomsDocument = new TypedDocumentString(`
    query Rooms {
  rooms {
    ...RoomFields
  }
}
    fragment RoomFields on Room {
  id
  name
  color
}`) as unknown as TypedDocumentString<RoomsQuery, RoomsQueryVariables>;
export const CreateRoomDocument = new TypedDocumentString(`
    mutation CreateRoom($input: CreateRoomInput!) {
  createRoom(input: $input) {
    ...RoomFields
  }
}
    fragment RoomFields on Room {
  id
  name
  color
}`) as unknown as TypedDocumentString<CreateRoomMutation, CreateRoomMutationVariables>;
export const UpdateRoomDocument = new TypedDocumentString(`
    mutation UpdateRoom($id: ID!, $input: UpdateRoomInput!) {
  updateRoom(id: $id, input: $input) {
    ...RoomFields
  }
}
    fragment RoomFields on Room {
  id
  name
  color
}`) as unknown as TypedDocumentString<UpdateRoomMutation, UpdateRoomMutationVariables>;
export const DeleteRoomDocument = new TypedDocumentString(`
    mutation DeleteRoom($id: ID!) {
  deleteRoom(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteRoomMutation, DeleteRoomMutationVariables>;
export const ServicesDocument = new TypedDocumentString(`
    query Services($includeArchived: Boolean) {
  services(includeArchived: $includeArchived) {
    ...ServiceFields
  }
}
    fragment ServicePriceFields on ServicePrice {
  id
  durationMin
  days
  amount
  validFrom
  validTo
}
fragment ServiceFields on Service {
  id
  name
  description
  isActive
  prices {
    ...ServicePriceFields
  }
}`) as unknown as TypedDocumentString<ServicesQuery, ServicesQueryVariables>;
export const CreateServiceDocument = new TypedDocumentString(`
    mutation CreateService($input: CreateServiceInput!) {
  createService(input: $input) {
    ...ServiceFields
  }
}
    fragment ServicePriceFields on ServicePrice {
  id
  durationMin
  days
  amount
  validFrom
  validTo
}
fragment ServiceFields on Service {
  id
  name
  description
  isActive
  prices {
    ...ServicePriceFields
  }
}`) as unknown as TypedDocumentString<CreateServiceMutation, CreateServiceMutationVariables>;
export const UpdateServiceDocument = new TypedDocumentString(`
    mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
  updateService(id: $id, input: $input) {
    ...ServiceFields
  }
}
    fragment ServicePriceFields on ServicePrice {
  id
  durationMin
  days
  amount
  validFrom
  validTo
}
fragment ServiceFields on Service {
  id
  name
  description
  isActive
  prices {
    ...ServicePriceFields
  }
}`) as unknown as TypedDocumentString<UpdateServiceMutation, UpdateServiceMutationVariables>;
export const DeleteServiceDocument = new TypedDocumentString(`
    mutation DeleteService($id: ID!) {
  deleteService(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteServiceMutation, DeleteServiceMutationVariables>;
export const TherapistsDocument = new TypedDocumentString(`
    query Therapists {
  therapists {
    ...TherapistFields
  }
}
    fragment TherapistFields on Therapist {
  id
  name
  offDays
  leaveDates
}`) as unknown as TypedDocumentString<TherapistsQuery, TherapistsQueryVariables>;
export const CreateTherapistDocument = new TypedDocumentString(`
    mutation CreateTherapist($input: CreateTherapistInput!) {
  createTherapist(input: $input) {
    ...TherapistFields
  }
}
    fragment TherapistFields on Therapist {
  id
  name
  offDays
  leaveDates
}`) as unknown as TypedDocumentString<CreateTherapistMutation, CreateTherapistMutationVariables>;
export const UpdateTherapistDocument = new TypedDocumentString(`
    mutation UpdateTherapist($id: ID!, $input: UpdateTherapistInput!) {
  updateTherapist(id: $id, input: $input) {
    ...TherapistFields
  }
}
    fragment TherapistFields on Therapist {
  id
  name
  offDays
  leaveDates
}`) as unknown as TypedDocumentString<UpdateTherapistMutation, UpdateTherapistMutationVariables>;
export const DeleteTherapistDocument = new TypedDocumentString(`
    mutation DeleteTherapist($id: ID!) {
  deleteTherapist(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteTherapistMutation, DeleteTherapistMutationVariables>;
export const TherapistConflictsDocument = new TypedDocumentString(`
    query TherapistConflicts($id: ID!, $offDays: [Int!], $leaveDates: [String!]) {
  therapistConflicts(id: $id, offDays: $offDays, leaveDates: $leaveDates) {
    ...BookingFields
  }
}
    fragment BookingFields on Booking {
  id
  client
  clientId
  clientMobile
  isRequested
  promoId
  promoCode
  therapistId
  roomId
  serviceId
  start
  end
  status
  source
}`) as unknown as TypedDocumentString<TherapistConflictsQuery, TherapistConflictsQueryVariables>;
export const SmsLogsDocument = new TypedDocumentString(`
    query SmsLogs($status: SmsStatus, $limit: Int) {
  smsLogs(status: $status, limit: $limit) {
    id
    to
    purpose
    message
    status
    attempts
    error
    bookingId
    clientId
    createdAt
    sentAt
  }
}
    `) as unknown as TypedDocumentString<SmsLogsQuery, SmsLogsQueryVariables>;
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
  twoFactorEnabled
  createdAt
}`) as unknown as TypedDocumentString<UsersQuery, UsersQueryVariables>;
export const ResetUserTwoFactorDocument = new TypedDocumentString(`
    mutation ResetUserTwoFactor($userId: ID!) {
  resetUserTwoFactor(userId: $userId)
}
    `) as unknown as TypedDocumentString<
    ResetUserTwoFactorMutation,
    ResetUserTwoFactorMutationVariables
>;
