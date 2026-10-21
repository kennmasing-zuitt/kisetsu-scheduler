"use client";

import { useState, type FormEvent } from "react";
import Loader from "@/components/ui/Loader";
import {
    useDisableTwoFactorMutation,
    useMeQuery,
    useRegenerateRecoveryCodesMutation,
    useSessionQuery,
} from "@/mods/auth/authApi";
import { setCredentials } from "@/mods/auth/authSlice";
import RecoveryCodes from "@/mods/auth/components/RecoveryCodes";
import TwoFactorSetup from "@/mods/auth/components/TwoFactorSetup";
import { useAppDispatch } from "@/store/hooks";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

type Panel = "none" | "setup" | "disable" | "codes";

export default function SecurityPage() {
    const dispatch = useAppDispatch();
    const me = useMeQuery();
    const session = useSessionQuery();
    const [panel, setPanel] = useState<Panel>("none");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [newCodes, setNewCodes] = useState<string[] | null>(null);
    const [disable, disableState] = useDisableTwoFactorMutation();
    const [regenerate, regenerateState] = useRegenerateRecoveryCodesMutation();

    if (me.isLoading || session.isLoading) return <Loader label="Loading…" />;
    const enabled = Boolean(me.data?.twoFactorEnabled);
    const required = Boolean(session.data?.twoFactorRequired);

    function close() {
        setPanel("none");
        setPassword("");
        setCode("");
        setNewCodes(null);
    }

    async function onDisable(e: FormEvent) {
        e.preventDefault();
        try {
            await disable({ password, code }).unwrap();
            close();
        } catch {
            /* shown below */
        }
    }

    async function onRegenerate(e: FormEvent) {
        e.preventDefault();
        try {
            setNewCodes(await regenerate({ code }).unwrap());
        } catch {
            /* shown below */
        }
    }

    return (
        <>
            <div className="page__header">
                <div>
                    <h1>Security</h1>
                    <p className="muted">How you sign in to the scheduling app.</p>
                </div>
            </div>

            <section className="card stack">
                <div className="row-between">
                    <div>
                        <h2>Two-factor sign-in</h2>
                        <p className="muted">
                            A 6-digit code from an authenticator app on your phone, asked after your
                            password.
                            {required && " Your role requires it."}
                        </p>
                    </div>
                    <span className={enabled ? "chip chip--on" : "chip"}>
                        {enabled ? "On" : "Off"}
                    </span>
                </div>

                {panel === "none" && (
                    <div className="row-actions row-actions--start">
                        {!enabled && (
                            <button className="btn btn--primary" onClick={() => setPanel("setup")}>
                                Turn on
                            </button>
                        )}
                        {enabled && (
                            <button className="btn btn--ghost" onClick={() => setPanel("codes")}>
                                New recovery codes
                            </button>
                        )}
                        {enabled && !required && (
                            <button className="btn btn--danger" onClick={() => setPanel("disable")}>
                                Turn off
                            </button>
                        )}
                    </div>
                )}

                {panel === "setup" && (
                    <TwoFactorSetup
                        onCancel={close}
                        onDone={(result) => {
                            dispatch(setCredentials({ token: result.token, user: result.user }));
                            close();
                        }}
                    />
                )}

                {panel === "disable" && (
                    <form className="stack" onSubmit={onDisable}>
                        <div className="field-row">
                            <label className="field">
                                <span>Password</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                            </label>
                            <label className="field">
                                <span>Code from the app</span>
                                <input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    required
                                />
                            </label>
                        </div>
                        {disableState.error && (
                            <p className="alert">{(disableState.error as GraphqlError).message}</p>
                        )}
                        <div className="row-actions">
                            <button type="button" className="btn btn--ghost" onClick={close}>
                                Cancel
                            </button>
                            <button className="btn btn--danger" disabled={disableState.isLoading}>
                                Turn off two-factor
                            </button>
                        </div>
                    </form>
                )}

                {panel === "codes" &&
                    (newCodes ? (
                        <RecoveryCodes codes={newCodes} onDone={close} />
                    ) : (
                        <form className="stack" onSubmit={onRegenerate}>
                            <p className="muted">
                                Your old recovery codes stop working. Enter a code from the app to
                                continue.
                            </p>
                            <label className="field">
                                <span>Code from the app</span>
                                <input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    required
                                    autoFocus
                                />
                            </label>
                            {regenerateState.error && (
                                <p className="alert">
                                    {(regenerateState.error as GraphqlError).message}
                                </p>
                            )}
                            <div className="row-actions">
                                <button type="button" className="btn btn--ghost" onClick={close}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn--primary"
                                    disabled={regenerateState.isLoading}
                                >
                                    Make new codes
                                </button>
                            </div>
                        </form>
                    ))}
            </section>
        </>
    );
}
