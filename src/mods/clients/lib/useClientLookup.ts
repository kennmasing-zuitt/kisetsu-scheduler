"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { useGetClientByMobileQuery } from "@/mods/clients/clientsApi";
import { normalizeMobile } from "./mobile";
import type { Client } from "@/mods/clients/types";

/**
 * Looks the client up as soon as the typed mobile is a complete, valid number.
 *   normalized  canonical number, or null while incomplete / invalid
 *   client      the client on file, null for a new number, undefined while unknown
 */
export function useClientLookup(mobileInput: string) {
    const normalized = normalizeMobile(mobileInput);
    const { data, isFetching, isError } = useGetClientByMobileQuery(normalized ?? skipToken);
    return {
        normalized,
        client: (normalized && !isFetching && !isError ? data : undefined) as
            Client | null | undefined,
        isLooking: Boolean(normalized) && isFetching,
    };
}
