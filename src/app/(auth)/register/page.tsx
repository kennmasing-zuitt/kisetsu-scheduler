import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/mods/auth/components/AuthForm";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
    return (
        <Suspense>
            <AuthForm mode="register" />
        </Suspense>
    );
}
