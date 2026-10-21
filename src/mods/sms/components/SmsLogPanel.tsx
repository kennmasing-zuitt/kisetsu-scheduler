"use client";

import { useState } from "react";
import Loader from "@/components/ui/Loader";
import { usePermissions } from "@/mods/auth/usePermissions";
import { formatMobile } from "@/mods/clients/lib/mobile";
import { useGetSmsLogsQuery, type SmsLog } from "@/mods/sms/smsApi";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

const when = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

const PURPOSE: Record<SmsLog["purpose"], string> = {
    setupCode: "Setup code",
    rebook: "Cancellation",
};

/**
 * Texts sent to clients (setup codes for the booking site, cancellation / rebook notices).
 * Opens on the failed ones, so the front desk can call those clients instead.
 */
export default function SmsLogPanel() {
    const { can, isLoading: permsLoading } = usePermissions();
    const allowed = can("readSmsLogs");
    const [onlyFailed, setOnlyFailed] = useState(true);
    const {
        data = [],
        isLoading,
        error,
    } = useGetSmsLogsQuery({ status: onlyFailed ? "failed" : null, limit: 50 }, { skip: !allowed });
    if (permsLoading || !allowed) return null;

    return (
        <section className="card manage-card" aria-labelledby="sms-heading">
            <div className="manage-card__header">
                <h2 id="sms-heading">Text messages</h2>
                <div className="segmented" role="group" aria-label="Show">
                    <button
                        type="button"
                        className={onlyFailed ? "is-active" : ""}
                        aria-pressed={onlyFailed}
                        onClick={() => setOnlyFailed(true)}
                    >
                        Failed
                    </button>
                    <button
                        type="button"
                        className={onlyFailed ? "" : "is-active"}
                        aria-pressed={!onlyFailed}
                        onClick={() => setOnlyFailed(false)}
                    >
                        All
                    </button>
                </div>
            </div>
            <p className="muted small">
                Texts that couldn&apos;t be delivered after 3 tries show here: call those clients.
            </p>

            {isLoading && <Loader label="Loading texts…" />}
            {error && <p className="alert">{(error as GraphqlError).message}</p>}
            {!isLoading && !error && data.length === 0 && (
                <p className="muted">{onlyFailed ? "No failed texts." : "No texts sent yet."}</p>
            )}

            {data.length > 0 && (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>When</th>
                                <th>To</th>
                                <th>Type</th>
                                <th>Message</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((m) => (
                                <tr key={m.id}>
                                    <td>{when(m.createdAt)}</td>
                                    <td>{formatMobile(m.to)}</td>
                                    <td>{PURPOSE[m.purpose] ?? m.purpose}</td>
                                    <td className="small sms-message">{m.message}</td>
                                    <td>
                                        <span
                                            className={
                                                m.status === "sent"
                                                    ? "chip chip--on"
                                                    : m.status === "failed"
                                                      ? "chip chip--warn"
                                                      : "chip"
                                            }
                                            title={m.error ?? undefined}
                                        >
                                            {m.status === "sent"
                                                ? "Sent"
                                                : m.status === "failed"
                                                  ? "Failed"
                                                  : "Sending"}
                                        </span>
                                        {m.error && <div className="muted small">{m.error}</div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
