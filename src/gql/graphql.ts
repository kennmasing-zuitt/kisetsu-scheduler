/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
    T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type CreateBookingInput = {
    client: string;
    end: string;
    roomId: string | number;
    /** Must have a price for the booking length on its date */
    serviceId: string | number;
    start: string;
    therapistId: string | number;
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

export type LoginInput = {
    email: string;
    password: string;
};

/** Granular permissions. Admin permissions (superAdmin, readUsers, manageUserAccess, readRoles, manageRoles, logoutUsers, impersonateUsers, readAuditLogs) only apply through an admin-kind role; superAdmin implies every permission. */
export type Permission =
    | "createBooking"
    | "createExample"
    | "createRoom"
    | "createService"
    | "createTherapist"
    | "deleteBooking"
    | "deleteExample"
    | "deleteRoom"
    | "deleteService"
    | "deleteTherapist"
    | "impersonateUsers"
    | "logoutUsers"
    | "manageRoles"
    | "manageUserAccess"
    | "readAuditLogs"
    | "readReports"
    | "readRoles"
    | "readUsers"
    | "superAdmin"
    | "updateBooking"
    | "updateExample"
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

/** noService = booking has no service; noPrice = no price rule for its date/length */
export type UnpricedReason = "noPrice" | "noService";

/** Only the fields you send are changed; the result must still pass every rule */
export type UpdateBookingInput = {
    client?: string | null | undefined;
    end?: string | null | undefined;
    roomId?: string | number | null | undefined;
    serviceId?: string | number | null | undefined;
    start?: string | null | undefined;
    therapistId?: string | number | null | undefined;
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

export type SessionQueryVariables = Exact<{ [key: string]: never }>;

export type SessionQuery = { session: { effectivePerms: Array<Permission> } };

export type SalesLineFieldsFragment = {
    serviceId: string;
    serviceName: string;
    durationMin: number;
    unitPrice: number;
    bookings: number;
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
        totals: { bookings: number; minutes: number; revenue: number; unpriced: number };
        therapists: Array<{
            therapistId: string;
            therapistName: string;
            bookings: number;
            minutes: number;
            revenue: number;
            unpriced: number;
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
                revenue: number;
            }>;
        }>;
        services: Array<{
            serviceId: string;
            serviceName: string;
            isActive: boolean;
            bookings: number;
            minutes: number;
            revenue: number;
            unpriced: number;
            lines: Array<{
                serviceId: string;
                serviceName: string;
                durationMin: number;
                unitPrice: number;
                bookings: number;
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
        therapistId: string;
        roomId: string;
        serviceId: string | null;
        start: string;
        end: string;
    }>;
};

export type CreateBookingMutationVariables = Exact<{
    input: CreateBookingInput;
}>;

export type CreateBookingMutation = {
    createBooking: {
        id: string;
        client: string;
        therapistId: string;
        roomId: string;
        serviceId: string | null;
        start: string;
        end: string;
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
        therapistId: string;
        roomId: string;
        serviceId: string | null;
        start: string;
        end: string;
    };
};

export type DeleteBookingMutationVariables = Exact<{
    id: string | number;
}>;

export type DeleteBookingMutation = { deleteBooking: boolean };

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
    therapistId: string;
    roomId: string;
    serviceId: string | null;
    start: string;
    end: string;
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
export const SalesLineFieldsFragmentDoc = new TypedDocumentString(
    `
    fragment SalesLineFields on SalesLine {
  serviceId
  serviceName
  durationMin
  unitPrice
  bookings
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
  therapistId
  roomId
  serviceId
  start
  end
}
    `,
    { fragmentName: "BookingFields" },
) as unknown as TypedDocumentString<BookingFieldsFragment, unknown>;
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
export const SessionDocument = new TypedDocumentString(`
    query Session {
  session {
    effectivePerms
  }
}
    `) as unknown as TypedDocumentString<SessionQuery, SessionQueryVariables>;
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
      revenue
      unpriced
    }
    therapists {
      therapistId
      therapistName
      bookings
      minutes
      revenue
      unpriced
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
  }
}
    fragment SalesLineFields on SalesLine {
  serviceId
  serviceName
  durationMin
  unitPrice
  bookings
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
  therapistId
  roomId
  serviceId
  start
  end
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
  therapistId
  roomId
  serviceId
  start
  end
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
  therapistId
  roomId
  serviceId
  start
  end
}`) as unknown as TypedDocumentString<UpdateBookingMutation, UpdateBookingMutationVariables>;
export const DeleteBookingDocument = new TypedDocumentString(`
    mutation DeleteBooking($id: ID!) {
  deleteBooking(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteBookingMutation, DeleteBookingMutationVariables>;
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
