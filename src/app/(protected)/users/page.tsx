"use client";

import { useState } from "react";
import { usePermissions } from "@/mods/auth/usePermissions";
import { useGetUsersQuery, useResetUserTwoFactorMutation } from "@/mods/users/usersApi";
import Loader from "@/components/ui/Loader";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

export default function UsersPage() {
    const { data: userPage, isLoading, error, refetch, isFetching } = useGetUsersQuery();
    const users = userPage?.data;
    const { can } = usePermissions();
    const canReset = can("resetTwoFactor");
    const [resetTwoFactor, resetState] = useResetUserTwoFactorMutation();
    const [confirming, setConfirming] = useState<string | null>(null);

    return (
        <>
            <div className="page__header">
                <h1>Users</h1>
                <button className="btn btn--ghost" onClick={() => refetch()} disabled={isFetching}>
                    {isFetching ? "Refreshing…" : "Refresh"}
                </button>
            </div>

            {isLoading && <Loader label="Loading users…" />}

            {error && (
                <p className="alert">
                    {(error as GraphqlError).code === "FORBIDDEN"
                        ? "You don't have permission to view users."
                        : (error as GraphqlError).message}
                </p>
            )}

            {resetState.error && (
                <p className="alert">{(resetState.error as GraphqlError).message}</p>
            )}

            {users && (
                <div className="card table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Extra permissions</th>
                                <th>Two-factor</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        {u.role ? (
                                            <span className="badge">{u.role.name}</span>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td>{u.extraPerms.length ? u.extraPerms.join(", ") : "—"}</td>
                                    <td>
                                        {u.twoFactorEnabled ? (
                                            <span className="chip chip--on">On</span>
                                        ) : (
                                            <span className="muted">Off</span>
                                        )}
                                        {canReset && u.twoFactorEnabled && confirming !== u.id && (
                                            <button
                                                className="link-button small"
                                                style={{ marginLeft: 8 }}
                                                onClick={() => setConfirming(u.id)}
                                            >
                                                Reset
                                            </button>
                                        )}
                                        {confirming === u.id && (
                                            <span className="row-actions row-actions--start">
                                                <button
                                                    className="btn btn--sm btn--ghost"
                                                    onClick={() => setConfirming(null)}
                                                >
                                                    Keep
                                                </button>
                                                <button
                                                    className="btn btn--sm btn--danger"
                                                    disabled={resetState.isLoading}
                                                    title="Lost phone: turns 2FA off and signs them out"
                                                    onClick={async () => {
                                                        try {
                                                            await resetTwoFactor(u.id).unwrap();
                                                        } finally {
                                                            setConfirming(null);
                                                        }
                                                    }}
                                                >
                                                    Reset 2FA
                                                </button>
                                            </span>
                                        )}
                                    </td>
                                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
