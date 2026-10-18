"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { api, useLogoutMutation } from "@/store/api";
import { clearCredentials } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/**
 * Visiting /logout signs the user out: calls the `logout` mutation (so the server can
 * revoke the refresh token / clear its cookie), then clears local state and cache.
 */
export default function LogoutPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { hydrated, accessToken } = useAppSelector((s) => s.auth);
    const [logout] = useLogoutMutation();
    const started = useRef(false);

    useEffect(() => {
        if (!hydrated || started.current) return;
        started.current = true;

        (async () => {
            if (accessToken) {
                try {
                    await logout().unwrap();
                } catch {
                    /* sign out locally even if the server call fails */
                }
            }
            dispatch(clearCredentials());
            dispatch(api.util.resetApiState());
            router.replace("/login");
        })();
    }, [hydrated, accessToken, logout, dispatch, router]);

    return (
        <main className="auth-shell">
            <Loader label="Signing you out…" />
        </main>
    );
}
