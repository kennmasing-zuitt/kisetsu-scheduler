"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    useLoginMutation,
    useLoginTwoFactorMutation,
    useRegisterMutation,
} from "@/mods/auth/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/mods/auth/authSlice";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";
import type { AuthPayload } from "@/mods/auth/types";
import TwoFactorSetup from "./TwoFactorSetup";

type Mode = "login" | "register";

/** After the password: enter a code, or set the authenticator up first (roles that require it) */
type Step =
    | { kind: "credentials" }
    | { kind: "code"; challengeToken: string }
    | { kind: "setup"; challengeToken: string };

/** Shared Register/Login form; `mode` switches fields, mutation and copy. */
export default function AuthForm({ mode }: { mode: Mode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const [login, loginState] = useLoginMutation();
    const [register, registerState] = useRegisterMutation();
    const [loginTwoFactor, twoFactorState] = useLoginTwoFactorMutation();
    const [step, setStep] = useState<Step>({ kind: "credentials" });
    const [code, setCode] = useState("");
    const [useRecovery, setUseRecovery] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const isLogin = mode === "login";
    const { isLoading, error } = isLogin ? loginState : registerState;

    function signedIn(payload: AuthPayload) {
        dispatch(setCredentials(payload));
        const next = searchParams.get("next");
        router.replace(next && next.startsWith("/") ? next : "/");
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        try {
            if (!isLogin) return signedIn(await register({ name, email, password }).unwrap());
            const result = await login({ email, password }).unwrap();
            if (result.token && result.user)
                return signedIn({ token: result.token, user: result.user });
            if (result.challengeToken) {
                setStep({
                    kind: result.twoFactorRequired ? "code" : "setup",
                    challengeToken: result.challengeToken,
                });
            }
        } catch {
            /* error is shown from mutation state */
        }
    }

    async function onCode(e: FormEvent) {
        e.preventDefault();
        if (step.kind !== "code") return;
        try {
            signedIn(await loginTwoFactor({ challengeToken: step.challengeToken, code }).unwrap());
        } catch (err) {
            // The 5-minute challenge ran out (or a logout happened): back to the password
            if ((err as GraphqlError).code === "TWO_FACTOR_CHALLENGE_EXPIRED") restart();
        }
    }

    function restart() {
        setStep({ kind: "credentials" });
        setCode("");
        setPassword("");
        setUseRecovery(false);
    }

    if (step.kind === "setup") {
        return (
            <div className="card auth-card">
                <h1>Set up two-factor sign-in</h1>
                <p className="muted">
                    Your role needs a code from an authenticator app at every sign-in. It takes a
                    minute.
                </p>
                <TwoFactorSetup
                    challengeToken={step.challengeToken}
                    onDone={(result) => signedIn(result)}
                    onCancel={restart}
                />
            </div>
        );
    }

    if (step.kind === "code") {
        return (
            <form className="card auth-card" onSubmit={onCode}>
                <h1>Enter your code</h1>
                <p className="muted">
                    {useRecovery
                        ? "Type one of the recovery codes you saved. Each works once."
                        : "Open your authenticator app and type the 6-digit code for Kisetsu."}
                </p>
                <label className="field">
                    <span>{useRecovery ? "Recovery code" : "6-digit code"}</span>
                    <input
                        key={useRecovery ? "recovery" : "totp"}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        inputMode={useRecovery ? "text" : "numeric"}
                        autoComplete="one-time-code"
                        placeholder={useRecovery ? "xxxx-xxxx" : "123456"}
                        maxLength={useRecovery ? 12 : 7}
                        required
                        autoFocus
                    />
                </label>
                {twoFactorState.error && (
                    <p className="alert">{(twoFactorState.error as GraphqlError).message}</p>
                )}
                <button className="btn btn--primary btn--block" disabled={twoFactorState.isLoading}>
                    {twoFactorState.isLoading ? "Checking…" : "Verify"}
                </button>
                <p className="muted center">
                    <button
                        type="button"
                        className="link-button"
                        onClick={() => {
                            setUseRecovery(!useRecovery);
                            setCode("");
                        }}
                    >
                        {useRecovery
                            ? "Use the app code instead"
                            : "Lost your phone? Use a recovery code"}
                    </button>
                    {" · "}
                    <button type="button" className="link-button" onClick={restart}>
                        Start over
                    </button>
                </p>
            </form>
        );
    }

    return (
        <form className="card auth-card" onSubmit={onSubmit}>
            <h1>{isLogin ? "Welcome back" : "Create an account"}</h1>
            <p className="muted">
                {isLogin ? "Log in to continue." : "Register to start using the app."}
            </p>

            {!isLogin && (
                <label className="field">
                    <span>Name</span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                    />
                </label>
            )}
            <label className="field">
                <span>Email</span>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />
            </label>
            <label className="field">
                <span>Password</span>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={isLogin ? undefined : 8}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                />
            </label>

            {error && <p className="alert">{(error as GraphqlError).message}</p>}

            <button className="btn btn--primary btn--block" disabled={isLoading}>
                {isLoading ? "Please wait…" : isLogin ? "Log in" : "Register"}
            </button>

            <p className="muted center">
                {isLogin ? (
                    <>
                        No account yet? <Link href="/register">Register</Link>
                    </>
                ) : (
                    <>
                        Already registered? <Link href="/login">Log in</Link>
                    </>
                )}
            </p>
        </form>
    );
}
