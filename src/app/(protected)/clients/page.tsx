"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";
import { usePermissions } from "@/mods/auth/usePermissions";
import { useGetClientsQuery } from "@/mods/clients/clientsApi";
import { formatMobile } from "@/mods/clients/lib/mobile";
import ClientDialog from "@/mods/clients/components/ClientDialog";
import type { Client } from "@/mods/clients/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

const shortDate = (iso: string | null | undefined) =>
    iso
        ? new Date(iso).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "—";

export default function ClientsPage() {
    const { can, isLoading: permsLoading } = usePermissions();
    const allowed = can("readClients");

    const [input, setInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Client | null>(null);

    // Search 300 ms after typing stops
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(input.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [input]);

    const { data, isLoading, isFetching, error } = useGetClientsQuery(
        { search, page },
        { skip: !allowed },
    );

    if (permsLoading) return <Loader label="Checking your access…" />;

    return (
        <>
            <div className="page__header">
                <div>
                    <h1>Clients</h1>
                    <p className="muted">
                        Everyone who has booked, by mobile number. Clients are added automatically
                        with their first booking.
                    </p>
                </div>
            </div>

            {!allowed ? (
                <p className="alert" role="alert">
                    Your account can&apos;t view clients. Ask an admin for the{" "}
                    <code>readClients</code> permission.
                </p>
            ) : (
                <section className="card manage-card">
                    <input
                        className="search-input"
                        type="search"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Search by name or mobile (e.g. Juan, 0917 123)"
                        aria-label="Search clients"
                    />

                    {error && <p className="alert">{(error as GraphqlError).message}</p>}
                    {isLoading && <Loader label="Loading clients…" />}
                    {data && data.total === 0 && (
                        <p className="muted">
                            {search ? `No client matches "${search}".` : "No clients yet."}
                        </p>
                    )}

                    {data && data.data.length > 0 && (
                        <div className={isFetching ? "table-wrap is-refreshing" : "table-wrap"}>
                            <table className="table table--numbers table--clickable">
                                <thead>
                                    <tr>
                                        <th>Client</th>
                                        <th>Mobile</th>
                                        <th className="num">Visits</th>
                                        <th className="num">Upcoming</th>
                                        <th>Last visit</th>
                                        <th>Usually with</th>
                                        <th className="num">Asked for</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data.map((c) => (
                                        <tr
                                            key={c.id}
                                            tabIndex={0}
                                            onClick={() => setSelected(c)}
                                            onKeyDown={(e) => e.key === "Enter" && setSelected(c)}
                                        >
                                            <td>
                                                <strong>{c.fullName}</strong>
                                                {c.notes && (
                                                    <div className="muted small">{c.notes}</div>
                                                )}
                                            </td>
                                            <td>{formatMobile(c.mobile)}</td>
                                            <td className="num">{c.stats.visits}</td>
                                            <td className="num">{c.stats.upcoming || "—"}</td>
                                            <td>{shortDate(c.stats.lastVisit)}</td>
                                            <td>{c.stats.favouriteTherapistName ?? "—"}</td>
                                            <td className="num">
                                                {c.stats.requested ? `${c.stats.requested}×` : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {data && data.totalPages > 1 && (
                        <div className="pager">
                            <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                ‹ Previous
                            </button>
                            <span className="muted small">
                                Page {data.page} of {data.totalPages} · {data.total} clients
                            </span>
                            <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                disabled={page >= data.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next ›
                            </button>
                        </div>
                    )}
                </section>
            )}

            <ClientDialog
                client={selected}
                canEdit={can("updateClient")}
                onClose={() => setSelected(null)}
            />
        </>
    );
}
