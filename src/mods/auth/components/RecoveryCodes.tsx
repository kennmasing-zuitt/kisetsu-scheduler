"use client";

import { useState } from "react";

/** One-time recovery codes, shown once: copy or download them, then confirm. */
export default function RecoveryCodes({
    codes,
    onDone,
    doneLabel = "I've saved them",
}: {
    codes: string[];
    onDone: () => void;
    doneLabel?: string;
}) {
    const [copied, setCopied] = useState(false);
    const text = codes.join("\n");

    async function copy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
        } catch {
            /* clipboard blocked: the codes are on screen to copy by hand */
        }
    }

    function download() {
        const blob = new Blob(
            [
                `Kisetsu scheduling app: recovery codes\nEach code works once, if you lose your phone.\n\n${text}\n`,
            ],
            { type: "text/plain" },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "kisetsu-recovery-codes.txt";
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="stack">
            <p className="notice">
                Save these <strong>recovery codes</strong> somewhere safe (a password manager or
                printed). If you lose your phone, each one signs you in once. They won&apos;t be
                shown again.
            </p>
            <ol className="recovery-codes">
                {codes.map((c) => (
                    <li key={c}>
                        <code>{c}</code>
                    </li>
                ))}
            </ol>
            <div className="row-actions">
                <button type="button" className="btn btn--ghost" onClick={copy}>
                    {copied ? "Copied" : "Copy"}
                </button>
                <button type="button" className="btn btn--ghost" onClick={download}>
                    Download .txt
                </button>
                <button type="button" className="btn btn--primary" onClick={onDone}>
                    {doneLabel}
                </button>
            </div>
        </div>
    );
}
