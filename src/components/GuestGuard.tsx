"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import Loader from "./Loader";

/** Wraps login/register: signed-in users are sent home instead. */
export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { hydrated, accessToken } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (hydrated && accessToken) router.replace("/");
  }, [hydrated, accessToken, router]);

  if (!hydrated || accessToken) return <Loader />;
  return <>{children}</>;
}
