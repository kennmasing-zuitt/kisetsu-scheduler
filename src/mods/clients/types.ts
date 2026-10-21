/**
 * App-facing client types, derived from the codegen output in src/gql.
 * Don't hand-edit shapes here: change mods/clients/graphql/clients.graphql and run `npm run codegen`.
 */
import type { ClientFieldsFragment, ClientsQuery } from "@/gql/graphql";

export type { UpdateClientInput } from "@/gql/graphql";

/** { id, mobile, firstName, lastName, fullName, notes, stats: { visits, upcoming, … } } */
export type Client = ClientFieldsFragment;
export type ClientStats = Client["stats"];
export type ClientPage = ClientsQuery["clients"];
