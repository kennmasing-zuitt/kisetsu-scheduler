/* eslint-disable */
import * as types from "./graphql";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Logout {\n  logout\n}\n\nquery Me {\n  me {\n    ...UserFields\n  }\n}\n\nquery Session {\n  session {\n    effectivePerms\n  }\n}": typeof types.RegisterDocument;
    "query Bookings($from: DateTime!, $to: DateTime!) {\n  bookings(from: $from, to: $to) {\n    ...BookingFields\n  }\n}\n\nmutation CreateBooking($input: CreateBookingInput!) {\n  createBooking(input: $input) {\n    ...BookingFields\n  }\n}\n\nmutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {\n  updateBooking(id: $id, input: $input) {\n    ...BookingFields\n  }\n}\n\nmutation DeleteBooking($id: ID!) {\n  deleteBooking(id: $id)\n}": typeof types.BookingsDocument;
    "query Rooms {\n  rooms {\n    ...RoomFields\n  }\n}\n\nmutation CreateRoom($input: CreateRoomInput!) {\n  createRoom(input: $input) {\n    ...RoomFields\n  }\n}\n\nmutation UpdateRoom($id: ID!, $input: UpdateRoomInput!) {\n  updateRoom(id: $id, input: $input) {\n    ...RoomFields\n  }\n}\n\nmutation DeleteRoom($id: ID!) {\n  deleteRoom(id: $id)\n}": typeof types.RoomsDocument;
    "fragment TherapistFields on Therapist {\n  id\n  name\n  offDays\n  leaveDates\n}\n\nfragment RoomFields on Room {\n  id\n  name\n  color\n}\n\nfragment BookingFields on Booking {\n  id\n  client\n  therapistId\n  roomId\n  start\n  end\n}": typeof types.TherapistFieldsFragmentDoc;
    "query Therapists {\n  therapists {\n    ...TherapistFields\n  }\n}\n\nmutation CreateTherapist($input: CreateTherapistInput!) {\n  createTherapist(input: $input) {\n    ...TherapistFields\n  }\n}\n\nmutation UpdateTherapist($id: ID!, $input: UpdateTherapistInput!) {\n  updateTherapist(id: $id, input: $input) {\n    ...TherapistFields\n  }\n}\n\nmutation DeleteTherapist($id: ID!) {\n  deleteTherapist(id: $id)\n}": typeof types.TherapistsDocument;
    "fragment UserFields on User {\n  id\n  name\n  email\n  role {\n    id\n    name\n  }\n  extraPerms\n  createdAt\n}": typeof types.UserFieldsFragmentDoc;
    "query Users {\n  users {\n    data {\n      ...UserFields\n    }\n    page\n    limit\n    total\n    totalPages\n  }\n}": typeof types.UsersDocument;
};
const documents: Documents = {
    "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Logout {\n  logout\n}\n\nquery Me {\n  me {\n    ...UserFields\n  }\n}\n\nquery Session {\n  session {\n    effectivePerms\n  }\n}":
        types.RegisterDocument,
    "query Bookings($from: DateTime!, $to: DateTime!) {\n  bookings(from: $from, to: $to) {\n    ...BookingFields\n  }\n}\n\nmutation CreateBooking($input: CreateBookingInput!) {\n  createBooking(input: $input) {\n    ...BookingFields\n  }\n}\n\nmutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {\n  updateBooking(id: $id, input: $input) {\n    ...BookingFields\n  }\n}\n\nmutation DeleteBooking($id: ID!) {\n  deleteBooking(id: $id)\n}":
        types.BookingsDocument,
    "query Rooms {\n  rooms {\n    ...RoomFields\n  }\n}\n\nmutation CreateRoom($input: CreateRoomInput!) {\n  createRoom(input: $input) {\n    ...RoomFields\n  }\n}\n\nmutation UpdateRoom($id: ID!, $input: UpdateRoomInput!) {\n  updateRoom(id: $id, input: $input) {\n    ...RoomFields\n  }\n}\n\nmutation DeleteRoom($id: ID!) {\n  deleteRoom(id: $id)\n}":
        types.RoomsDocument,
    "fragment TherapistFields on Therapist {\n  id\n  name\n  offDays\n  leaveDates\n}\n\nfragment RoomFields on Room {\n  id\n  name\n  color\n}\n\nfragment BookingFields on Booking {\n  id\n  client\n  therapistId\n  roomId\n  start\n  end\n}":
        types.TherapistFieldsFragmentDoc,
    "query Therapists {\n  therapists {\n    ...TherapistFields\n  }\n}\n\nmutation CreateTherapist($input: CreateTherapistInput!) {\n  createTherapist(input: $input) {\n    ...TherapistFields\n  }\n}\n\nmutation UpdateTherapist($id: ID!, $input: UpdateTherapistInput!) {\n  updateTherapist(id: $id, input: $input) {\n    ...TherapistFields\n  }\n}\n\nmutation DeleteTherapist($id: ID!) {\n  deleteTherapist(id: $id)\n}":
        types.TherapistsDocument,
    "fragment UserFields on User {\n  id\n  name\n  email\n  role {\n    id\n    name\n  }\n  extraPerms\n  createdAt\n}":
        types.UserFieldsFragmentDoc,
    "query Users {\n  users {\n    data {\n      ...UserFields\n    }\n    page\n    limit\n    total\n    totalPages\n  }\n}":
        types.UsersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Logout {\n  logout\n}\n\nquery Me {\n  me {\n    ...UserFields\n  }\n}\n\nquery Session {\n  session {\n    effectivePerms\n  }\n}",
): typeof import("./graphql").RegisterDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "query Bookings($from: DateTime!, $to: DateTime!) {\n  bookings(from: $from, to: $to) {\n    ...BookingFields\n  }\n}\n\nmutation CreateBooking($input: CreateBookingInput!) {\n  createBooking(input: $input) {\n    ...BookingFields\n  }\n}\n\nmutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {\n  updateBooking(id: $id, input: $input) {\n    ...BookingFields\n  }\n}\n\nmutation DeleteBooking($id: ID!) {\n  deleteBooking(id: $id)\n}",
): typeof import("./graphql").BookingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "query Rooms {\n  rooms {\n    ...RoomFields\n  }\n}\n\nmutation CreateRoom($input: CreateRoomInput!) {\n  createRoom(input: $input) {\n    ...RoomFields\n  }\n}\n\nmutation UpdateRoom($id: ID!, $input: UpdateRoomInput!) {\n  updateRoom(id: $id, input: $input) {\n    ...RoomFields\n  }\n}\n\nmutation DeleteRoom($id: ID!) {\n  deleteRoom(id: $id)\n}",
): typeof import("./graphql").RoomsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "fragment TherapistFields on Therapist {\n  id\n  name\n  offDays\n  leaveDates\n}\n\nfragment RoomFields on Room {\n  id\n  name\n  color\n}\n\nfragment BookingFields on Booking {\n  id\n  client\n  therapistId\n  roomId\n  start\n  end\n}",
): typeof import("./graphql").TherapistFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "query Therapists {\n  therapists {\n    ...TherapistFields\n  }\n}\n\nmutation CreateTherapist($input: CreateTherapistInput!) {\n  createTherapist(input: $input) {\n    ...TherapistFields\n  }\n}\n\nmutation UpdateTherapist($id: ID!, $input: UpdateTherapistInput!) {\n  updateTherapist(id: $id, input: $input) {\n    ...TherapistFields\n  }\n}\n\nmutation DeleteTherapist($id: ID!) {\n  deleteTherapist(id: $id)\n}",
): typeof import("./graphql").TherapistsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "fragment UserFields on User {\n  id\n  name\n  email\n  role {\n    id\n    name\n  }\n  extraPerms\n  createdAt\n}",
): typeof import("./graphql").UserFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "query Users {\n  users {\n    data {\n      ...UserFields\n    }\n    page\n    limit\n    total\n    totalPages\n  }\n}",
): typeof import("./graphql").UsersDocument;

export function graphql(source: string) {
    return (documents as any)[source] ?? {};
}
