# nextjs-redux-graphql-boilerplate-client

Next.js (App Router) + React + Redux Toolkit boilerplate that pairs with
**express-typescript-graphql-boilerplate-server**. Includes auth pages, a users list,
and a per-hour **FullCalendar** schedule.

| Route       | Page                    | Access    |
| ----------- | ----------------------- | --------- |
| `/login`    | Login                   | Guests    |
| `/register` | Register                | Guests    |
| `/`         | Home                    | Signed in |
| `/users`    | Users (`users` query)   | Signed in |
| `/schedule` | FullCalendar, 1h slots  | Signed in |
| `/logout`   | Signs out → `/login`    | Anyone    |
| anything else | 404 Page Not Found    | Anyone    |

## Stack

- Next.js 16 (App Router, TypeScript)
- Redux Toolkit 2 + RTK Query (GraphQL over `fetch`, no Apollo needed)
- FullCalendar 7 (`@fullcalendar/react` + `@fullcalendar/react-scheduler` for resource views)

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3000
```

No backend yet? Set `NEXT_PUBLIC_MOCK_API=true` in `.env.local` — an in-browser mock
answers the auth/users operations so you can click through every page.

## How auth works

```mermaid
sequenceDiagram
  participant UI as Login/Register page
  participant RTK as RTK Query (graphqlBaseQuery)
  participant API as GraphQL server
  participant Store as Redux auth slice
  UI->>RTK: login / register mutation
  RTK->>API: POST /graphql (credentials: include)
  API-->>RTK: { accessToken, user }
  RTK-->>UI: AuthPayload
  UI->>Store: setCredentials → persisted to localStorage
  Note over Store: Every later request sends Authorization: Bearer <token>
  API-->>RTK: error code UNAUTHENTICATED
  RTK->>Store: clearCredentials → AuthGuard redirects to /login
```

- `StoreProvider` restores the session from `localStorage` on load and keeps it in sync.
- `(protected)/layout.tsx` wraps pages in `AuthGuard` (redirects guests to `/login?next=…`
  and refreshes the user with the `me` query).
- `(auth)/layout.tsx` wraps login/register in `GuestGuard` (signed-in users go home).
- `/logout` calls the `logout` mutation (so the server can revoke a refresh token/cookie),
  then clears Redux state and the RTK Query cache.

## Matching your server schema

The GraphQL documents are **anticipated** from a typical type-graphql auth + RBAC setup:

```graphql
mutation Register($input: RegisterInput!) { register(input: $input) { accessToken user { ...UserFields } } }
mutation Login($input: LoginInput!)       { login(input: $input)    { accessToken user { ...UserFields } } }
mutation Logout                           { logout }
query Me                                  { me    { ...UserFields } }
query Users                               { users { ...UserFields } }

fragment UserFields on User { id name email role { id name } permissions createdAt }
```

If your resolvers differ, edit only:

1. `src/graphql/operations.ts` — operation names, inputs, selected fields
2. `src/types/auth.ts` — the matching TypeScript types
3. `transformResponse` in `src/store/api.ts` — if a top-level field name changed

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx               Root layout + Redux StoreProvider
│  ├─ not-found.tsx            404
│  ├─ logout/page.tsx
│  ├─ (auth)/                  Guest-only route group
│  │  ├─ layout.tsx            GuestGuard
│  │  ├─ login/page.tsx
│  │  └─ register/page.tsx
│  └─ (protected)/             Signed-in route group
│     ├─ layout.tsx            AuthGuard + Navbar + collapsible Sidebar
│     ├─ page.tsx              Home
│     ├─ users/page.tsx
│     └─ schedule/page.tsx     Loads ScheduleCalendar client-side only
├─ components/                 AuthForm, AuthGuard, GuestGuard, Navbar, Sidebar, Loader, ScheduleCalendar
├─ graphql/operations.ts       All GraphQL documents
├─ lib/graphqlBaseQuery.ts     RTK Query base query (Bearer token, errors, auto sign-out)
├─ lib/mockGraphql.ts          Offline mock (NEXT_PUBLIC_MOCK_API=true)
├─ store/                      makeStore, typed hooks, api slice, auth + schedule + ui slices
└─ types/auth.ts
```

## Layout

The navbar holds the menu toggle, profile and Log out; page links live in a collapsible
sidebar. The open/closed state is in `store/uiSlice.ts` and remembered in localStorage.
On desktop the sidebar pushes the page; under 768px it slides over it with a backdrop and
closes after you pick a page.

## The schedule

The Schedule page is a FullCalendar **resource time grid**: one column per massage
therapist, 1-hour rows (Day / Week switcher).

- **Day view:** `resources` is a function FullCalendar calls on every navigation
  (`refetchResourcesOnNavigate`). It returns only therapists working that day, so a weekly
  day off or one-off leave removes their column.
- **Week view:** one set of columns spans the week, so off-days are greyed out with
  per-therapist `businessHours`, and leave days with grey background events.
- **Booking:** drag down a therapist's column. A free room is picked automatically and
  you're asked for the client name. Drag or resize to move, or drag into another
  therapist's column to reassign; click to cancel. Bookings can't overlap for the same
  therapist or room, or land on a day the therapist is off.
- **Roster panel:** toggle weekly days off and leave for the visible day; the columns update
  straight away. A banner flags any booking assigned to a therapist who is off.

Data lives in `store/scheduleSlice.ts` (mock therapists, rooms, bookings) and the rules in
`lib/availability.ts`. When the backend has a scheduling module, back the `resources`
function in `ScheduleCalendar.tsx` with a query such as `availableTherapists(date)` and move
bookings into RTK Query endpoints.

**License:** resource views are FullCalendar Premium (`@fullcalendar/react-scheduler`). The
default `CC-Attribution-NonCommercial-NoDerivatives` key is for trials and non-commercial use;
set `NEXT_PUBLIC_FULLCALENDAR_LICENSE_KEY` to a commercial key before using it in a business.

## Adding a page

1. Create `src/app/(protected)/<name>/page.tsx` — it's automatically behind `AuthGuard`.
2. Add it to `navItems` in `src/components/Sidebar.tsx`.
3. Add any GraphQL operation to `operations.ts` and an endpoint in `store/api.ts`.
