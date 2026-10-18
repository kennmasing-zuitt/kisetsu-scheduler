"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useMeQuery } from "@/store/api";
import { setUser } from "@/store/authSlice";
import Loader from "./Loader";

/**
 * Wraps protected pages. Waits for the saved session to load, sends guests to
 * /login (remembering where they were going), and refreshes the user via `me`.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { hydrated, accessToken } = useAppSelector((s) => s.auth);

    const { data: me } = useMeQuery(undefined, { skip: !hydrated || !accessToken });

    useEffect(() => {
        if (hydrated && !accessToken) {
            router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        }
    }, [hydrated, accessToken, pathname, router]);

    useEffect(() => {
        if (me) dispatch(setUser(me));
    }, [me, dispatch]);

    if (!hydrated || !accessToken) return <Loader label="Checking your session…" />;
    return <>{children}</>;
}
