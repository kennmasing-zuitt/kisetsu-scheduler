"use client";

import { useState, type FormEvent } from "react";
import { useConfirmTwoFactorMutation, useSetupTwoFactorMutation } from "@/mods/auth/authApi";
import type { TwoFactorEnabled } from "@/mods/auth/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";
import RecoveryCodes from "./RecoveryCodes";

/** "ABCD EFGH IJKL …" so the secret can be typed by hand */
const groupSecret = (secret: string) => secret.replace(/(.{4})/g, "$1 ").trim();

/**
 * Turning on two-factor sign-in: show the QR code, check a first code, then the recovery codes.
 * Used on the Security page (signed in) and during login when the role requires it
 * (`challengeToken`). `onDone` gets the new session once the codes are saved.
 */
export default function TwoFactorSetup({
    challengeToken,
    onDone,
    onCancel,
}: {
    challengeToken?: string;
    onDone: (result: TwoFactorEnabled) => void;
    onCancel?: () => void;
}) {
    const [setup, setupState] = useSetupTwoFactorMutation();
    const [confirm, confirmState] = useConfirmTwoFactorMutation();
    const [code, setCode] = useState("");
    const [enabled, setEnabled] = useState<TwoFactorEnabled | null>(null);
    const qr = setupState.data;

    async function onConfirm(e: FormEvent) {
        e.preventDefault();
        try {
            setEnabled(await confirm({ code, challengeToken }).unwrap());
        } catch {
            /* shown below */
        }
    }

    if (enabled) {
        return (
            <RecoveryCodes
                codes={enabled.recoveryCodes}
                onDone={() => onDone(enabled)}
                doneLabel={challengeToken ? "Saved, continue" : "I've saved them"}
            />
        );
    }

    if (!qr) {
        return (
            <div className="stack">
                <ol className="steps">
                    <li>
                        Install <strong>Google Authenticator</strong> (or Microsoft Authenticator,
                        Authy, 1Password) on your phone.
                    </li>
                    <li>Scan the QR code shown next.</li>
                    <li>Type the 6-digit code it shows to finish.</li>
                </ol>
                {setupState.error && (
                    <p className="alert">{(setupState.error as GraphqlError).message}</p>
                )}
                <div className="row-actions">
                    {onCancel && (
                        <button type="button" className="btn btn--ghost" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn--primary"
                        disabled={setupState.isLoading}
                        onClick={() => setup(challengeToken ? { challengeToken } : undefined)}
                    >
                        {setupState.isLoading ? "Please wait…" : "Show QR code"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form className="stack" onSubmit={onConfirm}>
            <div className="totp-qr">
                {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL from the API */}
                <img
                    src={qr.qrDataUrl}
                    alt="QR code for your authenticator app"
                    width={200}
                    height={200}
                />
                <div className="muted small">
                    Can&apos;t scan? Add an account by hand with this key:
                    <code className="totp-secret">{groupSecret(qr.secret)}</code>
                </div>
            </div>
            <label className="field">
                <span>6-digit code from the app</span>
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9 ]{6,7}"
                    maxLength={7}
                    required
                    autoFocus
                />
            </label>
            {confirmState.error && (
                <p className="alert">{(confirmState.error as GraphqlError).message}</p>
            )}
            <div className="row-actions">
                {onCancel && (
                    <button type="button" className="btn btn--ghost" onClick={onCancel}>
                        Cancel
                    </button>
                )}
                <button className="btn btn--primary" disabled={confirmState.isLoading}>
                    {confirmState.isLoading ? "Checking…" : "Turn on"}
                </button>
            </div>
        </form>
    );
}
