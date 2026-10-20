"use client";

import { useCallback } from "react";
import { useSessionQuery } from "@/mods/auth/authApi";
import type { Permission } from "@/mods/auth/types";

/**
 * The signed-in user's effective permissions, from the `session` query.
 * `can("createRoom")` is false until the session has loaded, so actions appear rather than
 * disappear. This only shapes the UI: the server checks every permission again.
 */
export function usePermissions() {
    const { data, isLoading } = useSessionQuery();
    const perms = data?.effectivePerms;
    const can = useCallback((perm: Permission) => Boolean(perms?.includes(perm)), [perms]);
    return { can, isLoading };
}
