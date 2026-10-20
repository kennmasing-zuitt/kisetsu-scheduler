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
    start: string;
    therapistId: string | number;
};

export type CreateRoomInput = {
    color: string;
    name: string;
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
    | "createTherapist"
    | "deleteBooking"
    | "deleteExample"
    | "deleteRoom"
    | "deleteTherapist"
    | "impersonateUsers"
    | "logoutUsers"
    | "manageRoles"
    | "manageUserAccess"
    | "readAuditLogs"
    | "readRoles"
    | "readUsers"
    | "superAdmin"
    | "updateBooking"
    | "updateExample"
    | "updateRoom"
    | "updateTherapist";

export type RegisterInput = {
    /** Normalised to lowercase */
    email: string;
    name: string;
    /** 8-72 characters */
    password: string;
};

/** Only the fields you send are changed; the result must still pass every rule */
export type UpdateBookingInput = {
    client?: string | null | undefined;
    end?: string | null | undefined;
    roomId?: string | number | null | undefined;
    start?: string | null | undefined;
    therapistId?: string | number | null | undefined;
};

/** Only the fields you send are changed */
export type UpdateRoomInput = {
    color?: string | null | undefined;
    name?: string | null | undefined;
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
    start: string;
    end: string;
};

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
  start
  end
}
    `,
    { fragmentName: "BookingFields" },
) as unknown as TypedDocumentString<BookingFieldsFragment, unknown>;
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
