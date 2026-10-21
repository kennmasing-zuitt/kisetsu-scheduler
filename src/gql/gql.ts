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
    "fragment ClientFields on Client {\n  id\n  mobile\n  firstName\n  lastName\n  fullName\n  notes\n  createdAt\n  stats {\n    visits\n    upcoming\n    firstVisit\n    lastVisit\n    requested\n    favouriteTherapistId\n    favouriteTherapistName\n  }\n}\n\nquery Clients($search: String, $page: Int, $limit: Int) {\n  clients(search: $search, page: $page, limit: $limit) {\n    data {\n      ...ClientFields\n    }\n    page\n    limit\n    total\n    totalPages\n  }\n}\n\nquery ClientByMobile($mobile: String!) {\n  clientByMobile(mobile: $mobile) {\n    ...ClientFields\n  }\n}\n\nquery ClientBookings($clientId: ID!, $limit: Int) {\n  clientBookings(clientId: $clientId, limit: $limit) {\n    ...BookingFields\n  }\n}\n\nmutation UpdateClient($id: ID!, $input: UpdateClientInput!) {\n  updateClient(id: $id, input: $input) {\n    ...ClientFields\n  }\n}": typeof types.ClientFieldsFragmentDoc;
    "fragment SalesLineFields on SalesLine {\n  serviceId\n  serviceName\n  durationMin\n  unitPrice\n  bookings\n  grossRevenue\n  discounts\n  revenue\n}\n\nquery SalesReport($period: ReportPeriod!, $date: String!, $includeUpcoming: Boolean) {\n  salesReport(period: $period, date: $date, includeUpcoming: $includeUpcoming) {\n    period\n    from\n    to\n    timeZone\n    currency\n    includeUpcoming\n    generatedAt\n    totals {\n      bookings\n      minutes\n      grossRevenue\n      discounts\n      revenue\n      unpriced\n      requested\n    }\n    therapists {\n      therapistId\n      therapistName\n      bookings\n      minutes\n      grossRevenue\n      discounts\n      revenue\n      unpriced\n      requested\n      requestRate\n      services {\n        serviceId\n        serviceName\n        bookings\n        revenue\n      }\n      lines {\n        ...SalesLineFields\n      }\n    }\n    services {\n      serviceId\n      serviceName\n      isActive\n      bookings\n      minutes\n      grossRevenue\n      discounts\n      revenue\n      unpriced\n      lines {\n        ...SalesLineFields\n      }\n    }\n    series {\n      key\n      bookings\n      revenue\n    }\n    unpriced {\n      bookingId\n      client\n      start\n      durationMin\n      therapistName\n      serviceName\n      reason\n    }\n    promos {\n      promoId\n      code\n      bookings\n      discounts\n    }\n    clients {\n      uniqueClients\n      newClients\n      returningClients\n      noClient\n      top {\n        clientId\n        name\n        mobile\n        bookings\n        revenue\n        totalVisits\n      }\n    }\n  }\n}": typeof types.SalesLineFieldsFragmentDoc;
    "query Bookings($from: DateTime!, $to: DateTime!) {\n  bookings(from: $from, to: $to) {\n    ...BookingFields\n  }\n}\n\nmutation CreateBooking($input: CreateBookingInput!) {\n  createBooking(input: $input) {\n    ...BookingFields\n  }\n}\n\nmutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {\n  updateBooking(id: $id, input: $input) {\n    ...BookingFields\n  }\n}\n\nmutation DeleteBooking($id: ID!) {\n  deleteBooking(id: $id)\n}": typeof types.BookingsDocument;
    "query Promos($includeArchived: Boolean) {\n  promos(includeArchived: $includeArchived) {\n    ...PromoFields\n  }\n}\n\nmutation CreatePromo($input: CreatePromoInput!) {\n  createPromo(input: $input) {\n    ...PromoFields\n  }\n}\n\nmutation UpdatePromo($id: ID!, $input: UpdatePromoInput!) {\n  updatePromo(id: $id, input: $input) {\n    ...PromoFields\n  }\n}\n\nmutation DeletePromo($id: ID!) {\n  deletePromo(id: $id)\n}": typeof types.PromosDocument;
    "query Rooms {\n  rooms {\n    ...RoomFields\n  }\n}\n\nmutation CreateRoom($input: CreateRoomInput!) {\n  createRoom(input: $input) {\n    ...RoomFields\n  }\n}\n\nmutation UpdateRoom($id: ID!, $input: UpdateRoomInput!) {\n  updateRoom(id: $id, input: $input) {\n    ...RoomFields\n  }\n}\n\nmutation DeleteRoom($id: ID!) {\n  deleteRoom(id: $id)\n}": typeof types.RoomsDocument;
    "fragment TherapistFields on Therapist {\n  id\n  name\n  offDays\n  leaveDates\n}\n\nfragment RoomFields on Room {\n  id\n  name\n  color\n}\n\nfragment BookingFields on Booking {\n  id\n  client\n  clientId\n  clientMobile\n  isRequested\n  promoId\n  promoCode\n  therapistId\n  roomId\n  serviceId\n  start\n  end\n}\n\nfragment PromoFields on Promo {\n  id\n  code\n  description\n  discountType\n  value\n  validFrom\n  validTo\n  serviceIds\n  isActive\n  timesUsed\n  isLocked\n}\n\nfragment ServicePriceFields on ServicePrice {\n  id\n  durationMin\n  days\n  amount\n  validFrom\n  validTo\n}\n\nfragment ServiceFields on Service {\n  id\n  name\n  description\n  isActive\n  prices {\n    ...ServicePriceFields\n  }\n}": typeof types.TherapistFieldsFragmentDoc;
    "query Services($includeArchived: Boolean) {\n  services(includeArchived: $includeArchived) {\n    ...ServiceFields\n  }\n}\n\nmutation CreateService($input: CreateServiceInput!) {\n  createService(input: $input) {\n    ...ServiceFields\n  }\n}\n\nmutation UpdateService($id: ID!, $input: UpdateServiceInput!) {\n  updateService(id: $id, input: $input) {\n    ...ServiceFields\n  }\n}\n\nmutation DeleteService($id: ID!) {\n  deleteService(id: $id)\n}": typeof types.ServicesDocument;
    "query Therapists {\n  therapists {\n    ...TherapistFields\n  }\n}\n\nmutation CreateTherapist($input: CreateTherapistInput!) {\n  createTherapist(input: $input) {\n    ...TherapistFields\n  }\n}\n\nmutation UpdateTherapist($id: ID!, $input: UpdateTherapistInput!) {\n  updateTherapist(id: $id, input: $input) {\n    ...TherapistFields\n  }\n}\n\nmutation DeleteTherapist($id: ID!) {\n  deleteTherapist(id: $id)\n}": typeof types.TherapistsDocument;
    "fragment UserFields on User {\n  id\n  name\n  email\n  role {\n    id\n    name\n  }\n  extraPerms\n  createdAt\n}": typeof types.UserFieldsFragmentDoc;
    "query Users {\n  users {\n    data {\n      ...UserFields\n    }\n    page\n    limit\n    total\n    totalPages\n  }\n}": typeof types.UsersDocument;
};
const documents: Documents = {
    "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Logout {\n  logout\n}\n\nquery Me {\n  me {\n    ...UserFields\n  }\n}\n\nquery Session {\n  session {\n    effectivePerms\n  }\n}":
        types.RegisterDocument,
    "fragment ClientFields on Client {\n  id\n  mobile\n  firstName\n  lastName\n  fullName\n  notes\n  createdAt\n  stats {\n    visits\n    upcoming\n    firstVisit\n    lastVisit\n    requested\n    favouriteTherapistId\n    favouriteTherapistName\n  }\n}\n\nquery Clients($search: String, $page: Int, $limit: Int) {\n  clients(search: $search, page: $page, limit: $limit) {\n    data {\n      ...ClientFields\n    }\n    page\n    limit\n    total\n    totalPages\n  }\n}\n\nquery ClientByMobile($mobile: String!) {\n  clientByMobile(mobile: $mobile) {\n    ...ClientFields\n  }\n}\n\nquery ClientBookings($clientId: ID!, $limit: Int) {\n  clientBookings(clientId: $clientId, limit: $limit) {\n    ...BookingFields\n  }\n}\n\nmutation UpdateClient($id: ID!, $input: UpdateClientInput!) {\n  updateClient(id: $id, input: $input) {\n    ...ClientFields\n  }\n}":
        types.ClientFieldsFragmentDoc,
    "fragment SalesLineFields on SalesLine {\n  serviceId\n  serviceName\n  durationMin\n  unitPrice\n  bookings\n  grossRevenue\n  discounts\n  revenue\n}\n\nquery SalesReport($period: ReportPeriod!, $date: String!, $includeUpcoming: Boolean) {\n  salesReport(period: $period, date: $date, includeUpcoming: $includeUpcoming) {\n    period\n    from\n    to\n    timeZone\n    currency\n    includeUpcoming\n    generatedAt\n    totals {\n      bookings\n      minutes\n      grossRevenue\n      discounts\n      revenue\n      unpriced\n      requested\n    }\n    therapists {\n      therapistId\n      therapistName\n      bookings\n      minutes\n      grossRevenue\n      discounts\n      revenue\n      unpriced\n      requested\n      requestRate\n      services {\n        serviceId\n        serviceName\n        bookings\n        revenue\n      }\n      lines {\n        ...SalesLineFields\n      }\n    }\n    services {\n      serviceId\n      serviceName\n      isActive\n      bookings\n      minutes\n      grossRevenue\n      discounts\n      revenue\n      unpriced\n      lines {\n        ...SalesLineFields\n      }\n    }\n    series {\n      key\n      bookings\n      revenue\n    }\n    unpriced {\n      bookingId\n      client\n      start\n      durationMin\n      therapistName\n      serviceName\n      reason\n    }\n    promos {\n      promoId\n      code\n      bookings\n      discounts\n    }\n    clients {\n      uniqueClients\n      newClients\n      returningClients\n      noClient\n      top {\n        clientId\n        name\n        mobile\n        bookings\n        revenue\n        totalVisits\n      }\n    }\n  }\n}":
        types.SalesLineFieldsFragmentDoc,
    "query Bookings($from: DateTime!, $to: DateTime!) {\n  bookings(from: $from, to: $to) {\n    ...BookingFields\n  }\n}\n\nmutation CreateBooking($input: CreateBookingInput!) {\n  createBooking(input: $input) {\n    ...BookingFields\n  }\n}\n\nmutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {\n  updateBooking(id: $id, input: $input) {\n    ...BookingFields\n  }\n}\n\nmutation DeleteBooking($id: ID!) {\n  deleteBooking(id: $id)\n}":
        types.BookingsDocument,
    "query Promos($includeArchived: Boolean) {\n  promos(includeArchived: $includeArchived) {\n    ...PromoFields\n  }\n}\n\nmutation CreatePromo($input: CreatePromoInput!) {\n  createPromo(input: $input) {\n    ...PromoFields\n  }\n}\n\nmutation UpdatePromo($id: ID!, $input: UpdatePromoInput!) {\n  updatePromo(id: $id, input: $input) {\n    ...PromoFields\n  }\n}\n\nmutation DeletePromo($id: ID!) {\n  deletePromo(id: $id)\n}":
        types.PromosDocument,
    "query Rooms {\n  rooms {\n    ...RoomFields\n  }\n}\n\nmutation CreateRoom($input: CreateRoomInput!) {\n  createRoom(input: $input) {\n    ...RoomFields\n  }\n}\n\nmutation UpdateRoom($id: ID!, $input: UpdateRoomInput!) {\n  updateRoom(id: $id, input: $input) {\n    ...RoomFields\n  }\n}\n\nmutation DeleteRoom($id: ID!) {\n  deleteRoom(id: $id)\n}":
        types.RoomsDocument,
    "fragment TherapistFields on Therapist {\n  id\n  name\n  offDays\n  leaveDates\n}\n\nfragment RoomFields on Room {\n  id\n  name\n  color\n}\n\nfragment BookingFields on Booking {\n  id\n  client\n  clientId\n  clientMobile\n  isRequested\n  promoId\n  promoCode\n  therapistId\n  roomId\n  serviceId\n  start\n  end\n}\n\nfragment PromoFields on Promo {\n  id\n  code\n  description\n  discountType\n  value\n  validFrom\n  validTo\n  serviceIds\n  isActive\n  timesUsed\n  isLocked\n}\n\nfragment ServicePriceFields on ServicePrice {\n  id\n  durationMin\n  days\n  amount\n  validFrom\n  validTo\n}\n\nfragment ServiceFields on Service {\n  id\n  name\n  description\n  isActive\n  prices {\n    ...ServicePriceFields\n  }\n}":
        types.TherapistFieldsFragmentDoc,
    "query Services($includeArchived: Boolean) {\n  services(includeArchived: $includeArchived) {\n    ...ServiceFields\n  }\n}\n\nmutation CreateService($input: CreateServiceInput!) {\n  createService(input: $input) {\n    ...ServiceFields\n  }\n}\n\nmutation UpdateService($id: ID!, $input: UpdateServiceInput!) {\n  updateService(id: $id, input: $input) {\n    ...ServiceFields\n  }\n}\n\nmutation DeleteService($id: ID!) {\n  deleteService(id: $id)\n}":
        types.ServicesDocument,
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
    source: "fragment ClientFields on Client {\n  id\n  mobile\n  firstName\n  lastName\n  fullName\n  notes\n  createdAt\n  stats {\n    visits\n    upcoming\n    firstVisit\n    lastVisit\n    requested\n    favouriteTherapistId\n    favouriteTherapistName\n  }\n}\n\nquery Clients($search: String, $page: Int, $limit: Int) {\n  clients(search: $search, page: $page, limit: $limit) {\n    data {\n      ...ClientFields\n    }\n    page\n    limit\n    total\n    totalPages\n  }\n}\n\nquery ClientByMobile($mobile: String!) {\n  clientByMobile(mobile: $mobile) {\n    ...ClientFields\n  }\n}\n\nquery ClientBookings($clientId: ID!, $limit: Int) {\n  clientBookings(clientId: $clientId, limit: $limit) {\n    ...BookingFields\n  }\n}\n\nmutation UpdateClient($id: ID!, $input: UpdateClientInput!) {\n  updateClient(id: $id, input: $input) {\n    ...ClientFields\n  }\n}",
): typeof import("./graphql").ClientFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "fragment SalesLineFields on SalesLine {\n  serviceId\n  serviceName\n  durationMin\n  unitPrice\n  bookings\n  grossRevenue\n  discounts\n  revenue\n}\n\nquery SalesReport($period: ReportPeriod!, $date: String!, $includeUpcoming: Boolean) {\n  salesReport(period: $period, date: $date, includeUpcoming: $includeUpcoming) {\n    period\n    from\n    to\n    timeZone\n    currency\n    includeUpcoming\n    generatedAt\n    totals {\n      bookings\n      minutes\n      grossRevenue\n      discounts\n      revenue\n      unpriced\n      requested\n    }\n    therapists {\n      therapistId\n      therapistName\n      bookings\n      minutes\n      grossRevenue\n      discounts\n      revenue\n      unpriced\n      requested\n      requestRate\n      services {\n        serviceId\n        serviceName\n        bookings\n        revenue\n      }\n      lines {\n        ...SalesLineFields\n      }\n    }\n    services {\n      serviceId\n      serviceName\n      isActive\n      bookings\n      minutes\n      grossRevenue\n      discounts\n      revenue\n      unpriced\n      lines {\n        ...SalesLineFields\n      }\n    }\n    series {\n      key\n      bookings\n      revenue\n    }\n    unpriced {\n      bookingId\n      client\n      start\n      durationMin\n      therapistName\n      serviceName\n      reason\n    }\n    promos {\n      promoId\n      code\n      bookings\n      discounts\n    }\n    clients {\n      uniqueClients\n      newClients\n      returningClients\n      noClient\n      top {\n        clientId\n        name\n        mobile\n        bookings\n        revenue\n        totalVisits\n      }\n    }\n  }\n}",
): typeof import("./graphql").SalesLineFieldsFragmentDoc;
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
    source: "query Promos($includeArchived: Boolean) {\n  promos(includeArchived: $includeArchived) {\n    ...PromoFields\n  }\n}\n\nmutation CreatePromo($input: CreatePromoInput!) {\n  createPromo(input: $input) {\n    ...PromoFields\n  }\n}\n\nmutation UpdatePromo($id: ID!, $input: UpdatePromoInput!) {\n  updatePromo(id: $id, input: $input) {\n    ...PromoFields\n  }\n}\n\nmutation DeletePromo($id: ID!) {\n  deletePromo(id: $id)\n}",
): typeof import("./graphql").PromosDocument;
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
    source: "fragment TherapistFields on Therapist {\n  id\n  name\n  offDays\n  leaveDates\n}\n\nfragment RoomFields on Room {\n  id\n  name\n  color\n}\n\nfragment BookingFields on Booking {\n  id\n  client\n  clientId\n  clientMobile\n  isRequested\n  promoId\n  promoCode\n  therapistId\n  roomId\n  serviceId\n  start\n  end\n}\n\nfragment PromoFields on Promo {\n  id\n  code\n  description\n  discountType\n  value\n  validFrom\n  validTo\n  serviceIds\n  isActive\n  timesUsed\n  isLocked\n}\n\nfragment ServicePriceFields on ServicePrice {\n  id\n  durationMin\n  days\n  amount\n  validFrom\n  validTo\n}\n\nfragment ServiceFields on Service {\n  id\n  name\n  description\n  isActive\n  prices {\n    ...ServicePriceFields\n  }\n}",
): typeof import("./graphql").TherapistFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "query Services($includeArchived: Boolean) {\n  services(includeArchived: $includeArchived) {\n    ...ServiceFields\n  }\n}\n\nmutation CreateService($input: CreateServiceInput!) {\n  createService(input: $input) {\n    ...ServiceFields\n  }\n}\n\nmutation UpdateService($id: ID!, $input: UpdateServiceInput!) {\n  updateService(id: $id, input: $input) {\n    ...ServiceFields\n  }\n}\n\nmutation DeleteService($id: ID!) {\n  deleteService(id: $id)\n}",
): typeof import("./graphql").ServicesDocument;
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
