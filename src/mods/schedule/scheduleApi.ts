import { baseApi } from "@/store/baseApi";
import {
    BookingsDocument,
    CreateBookingDocument,
    CreateRoomDocument,
    CreateTherapistDocument,
    DeleteBookingDocument,
    DeleteRoomDocument,
    DeleteTherapistDocument,
    RoomsDocument,
    ServicesDocument,
    CreateServiceDocument,
    UpdateServiceDocument,
    DeleteServiceDocument,
    TherapistsDocument,
    UpdateBookingDocument,
    UpdateRoomDocument,
    UpdateTherapistDocument,
    type BookingsQuery,
    type BookingsQueryVariables,
    type CreateBookingMutation,
    type CreateBookingMutationVariables,
    type CreateRoomMutation,
    type CreateRoomMutationVariables,
    type CreateTherapistMutation,
    type CreateTherapistMutationVariables,
    type DeleteBookingMutation,
    type DeleteRoomMutation,
    type DeleteTherapistMutation,
    type RoomsQuery,
    type ServicesQuery,
    type CreateServiceMutation,
    type CreateServiceMutationVariables,
    type UpdateServiceMutation,
    type UpdateServiceMutationVariables,
    type DeleteServiceMutation,
    type TherapistsQuery,
    type UpdateBookingMutation,
    type UpdateBookingMutationVariables,
    type UpdateRoomMutation,
    type UpdateRoomMutationVariables,
    type UpdateTherapistMutation,
    type UpdateTherapistMutationVariables,
} from "@/gql/graphql";
import type {
    Booking,
    BookingRange,
    CreateBookingInput,
    CreateRoomInput,
    CreateTherapistInput,
    Room,
    Service,
    CreateServiceInput,
    UpdateServiceInput,
    Therapist,
    UpdateBookingInput,
    UpdateRoomInput,
    UpdateTherapistInput,
} from "./types";

interface UpdateArgs<TInput> {
    id: string;
    input: TInput;
}

/** The input without unset fields, for patching cached objects. */
const definedFields = <T extends object>(input: T) =>
    Object.fromEntries(
        Object.entries(input).filter(([, v]) => v !== undefined && v !== null),
    ) as Partial<{ [K in keyof T]: NonNullable<T[K]> }>;

export const scheduleApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // ---------- Therapists ----------
        getTherapists: build.query<Therapist[], void>({
            query: () => ({ document: TherapistsDocument }),
            transformResponse: (data: TherapistsQuery) => data.therapists,
            providesTags: ["Therapist"],
        }),
        createTherapist: build.mutation<Therapist, CreateTherapistInput>({
            query: (input) => ({
                document: CreateTherapistDocument,
                variables: { input } satisfies CreateTherapistMutationVariables,
            }),
            transformResponse: (data: CreateTherapistMutation) => data.createTherapist,
            invalidatesTags: ["Therapist"],
        }),
        /** Rename, or replace weekly days off / leave dates (the lists replace the stored ones). */
        updateTherapist: build.mutation<Therapist, UpdateArgs<UpdateTherapistInput>>({
            query: ({ id, input }) => ({
                document: UpdateTherapistDocument,
                variables: { id, input } satisfies UpdateTherapistMutationVariables,
            }),
            transformResponse: (data: UpdateTherapistMutation) => data.updateTherapist,
            // Optimistic: roster toggles update the calendar straight away, undone on error
            async onQueryStarted({ id, input }, { dispatch, queryFulfilled }) {
                const patch = dispatch(
                    scheduleApi.util.updateQueryData("getTherapists", undefined, (list) => {
                        const t = list.find((x) => x.id === id);
                        if (t) Object.assign(t, definedFields(input));
                    }),
                );
                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
            invalidatesTags: ["Therapist"],
        }),
        deleteTherapist: build.mutation<DeleteTherapistMutation["deleteTherapist"], string>({
            query: (id) => ({ document: DeleteTherapistDocument, variables: { id } }),
            transformResponse: (data: DeleteTherapistMutation) => data.deleteTherapist,
            invalidatesTags: ["Therapist", "Booking", "Report"],
        }),

        // ---------- Rooms ----------
        getRooms: build.query<Room[], void>({
            query: () => ({ document: RoomsDocument }),
            transformResponse: (data: RoomsQuery) => data.rooms,
            providesTags: ["Room"],
        }),
        createRoom: build.mutation<Room, CreateRoomInput>({
            query: (input) => ({
                document: CreateRoomDocument,
                variables: { input } satisfies CreateRoomMutationVariables,
            }),
            transformResponse: (data: CreateRoomMutation) => data.createRoom,
            invalidatesTags: ["Room"],
        }),
        updateRoom: build.mutation<Room, UpdateArgs<UpdateRoomInput>>({
            query: ({ id, input }) => ({
                document: UpdateRoomDocument,
                variables: { id, input } satisfies UpdateRoomMutationVariables,
            }),
            transformResponse: (data: UpdateRoomMutation) => data.updateRoom,
            invalidatesTags: ["Room"],
        }),
        deleteRoom: build.mutation<DeleteRoomMutation["deleteRoom"], string>({
            query: (id) => ({ document: DeleteRoomDocument, variables: { id } }),
            transformResponse: (data: DeleteRoomMutation) => data.deleteRoom,
            invalidatesTags: ["Room", "Booking", "Report"],
        }),

        // ---------- Services ----------
        /** Services with their full price history. `true` includes archived ones. */
        getServices: build.query<Service[], boolean | void>({
            query: (includeArchived) => ({
                document: ServicesDocument,
                variables: { includeArchived: Boolean(includeArchived) },
            }),
            transformResponse: (data: ServicesQuery) => data.services,
            providesTags: ["Service"],
        }),
        /** Server errors: VALIDATION_ERROR (e.g. overlapping prices), SERVICE_NAME_TAKEN */
        createService: build.mutation<Service, CreateServiceInput>({
            query: (input) => ({
                document: CreateServiceDocument,
                variables: { input } satisfies CreateServiceMutationVariables,
            }),
            transformResponse: (data: CreateServiceMutation) => data.createService,
            invalidatesTags: ["Service"],
        }),
        /** `prices` replaces the whole list; reports are re-priced from it. */
        updateService: build.mutation<Service, UpdateArgs<UpdateServiceInput>>({
            query: ({ id, input }) => ({
                document: UpdateServiceDocument,
                variables: { id, input } satisfies UpdateServiceMutationVariables,
            }),
            transformResponse: (data: UpdateServiceMutation) => data.updateService,
            invalidatesTags: ["Service", "Report"],
        }),
        /** Only for services no booking uses (SERVICE_IN_USE otherwise: archive instead). */
        deleteService: build.mutation<DeleteServiceMutation["deleteService"], string>({
            query: (id) => ({ document: DeleteServiceDocument, variables: { id } }),
            transformResponse: (data: DeleteServiceMutation) => data.deleteService,
            invalidatesTags: ["Service"],
        }),

        // ---------- Bookings ----------
        /** Bookings overlapping [from, to). One cache entry per range (a calendar view, a day). */
        getBookings: build.query<Booking[], BookingRange>({
            query: ({ from, to }) => ({
                document: BookingsDocument,
                variables: { from, to } satisfies BookingsQueryVariables,
            }),
            transformResponse: (data: BookingsQuery) => data.bookings,
            providesTags: ["Booking"],
        }),
        /** Server errors: THERAPIST_UNAVAILABLE, THERAPIST_DOUBLE_BOOKED, ROOM_TAKEN, VALIDATION_ERROR */
        createBooking: build.mutation<Booking, CreateBookingInput>({
            query: (input) => ({
                document: CreateBookingDocument,
                variables: { input } satisfies CreateBookingMutationVariables,
            }),
            transformResponse: (data: CreateBookingMutation) => data.createBooking,
            invalidatesTags: ["Booking", "Report"],
        }),
        /** Edit, move or reassign. Same errors as createBooking. */
        updateBooking: build.mutation<Booking, UpdateArgs<UpdateBookingInput>>({
            query: ({ id, input }) => ({
                document: UpdateBookingDocument,
                variables: { id, input } satisfies UpdateBookingMutationVariables,
            }),
            transformResponse: (data: UpdateBookingMutation) => data.updateBooking,
            // Optimistic: a dragged booking stays where it was dropped while the server checks it
            async onQueryStarted({ id, input }, { dispatch, getState, queryFulfilled }) {
                const ranges = scheduleApi.util.selectCachedArgsForQuery(getState(), "getBookings");
                const patches = ranges.map((range) =>
                    dispatch(
                        scheduleApi.util.updateQueryData("getBookings", range, (list) => {
                            const b = list.find((x) => x.id === id);
                            if (b) Object.assign(b, definedFields(input));
                        }),
                    ),
                );
                try {
                    await queryFulfilled;
                } catch {
                    patches.forEach((p) => p.undo());
                }
            },
            invalidatesTags: ["Booking", "Report"],
        }),
        /** Cancels a booking. */
        deleteBooking: build.mutation<DeleteBookingMutation["deleteBooking"], string>({
            query: (id) => ({ document: DeleteBookingDocument, variables: { id } }),
            transformResponse: (data: DeleteBookingMutation) => data.deleteBooking,
            invalidatesTags: ["Booking", "Report"],
        }),
    }),
});

export const {
    useGetTherapistsQuery,
    useCreateTherapistMutation,
    useUpdateTherapistMutation,
    useDeleteTherapistMutation,
    useGetRoomsQuery,
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
    useGetServicesQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation,
    useGetBookingsQuery,
    useCreateBookingMutation,
    useUpdateBookingMutation,
    useDeleteBookingMutation,
} = scheduleApi;
