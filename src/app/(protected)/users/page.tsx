"use client";

import { useGetUsersQuery } from "@/store/api";
import Loader from "@/components/Loader";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

export default function UsersPage() {
    const { data: users, isLoading, error, refetch, isFetching } = useGetUsersQuery();

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

            {users && (
                <div className="card table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Extra permissions</th>
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
                                    <td>{u.permissions.length ? u.permissions.join(", ") : "—"}</td>
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
