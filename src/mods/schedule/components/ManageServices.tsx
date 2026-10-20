"use client";

import { useState } from "react";
import { useDeleteServiceMutation, useGetServicesQuery } from "@/mods/schedule/scheduleApi";
import { usePermissions } from "@/mods/auth/usePermissions";
import { toDateKey } from "@/mods/schedule/lib/availability";
import { currentPrices, describeRule } from "@/mods/schedule/lib/pricing";
import type { Service } from "@/mods/schedule/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";
import Loader from "@/components/ui/Loader";
import ServiceDialog from "./ServiceDialog";

const shortDate = (key: string) =>
    new Date(`${key}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

/** Services and what they cost today: add, edit prices, archive, delete. */
export default function ManageServices() {
    const { data: services = [], isLoading, error } = useGetServicesQuery(true);
    const [deleteService, deleteState] = useDeleteServiceMutation();
    const { can, isLoading: permsLoading, error: permsError } = usePermissions();

    const [editing, setEditing] = useState<Service | "new" | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [showArchived, setShowArchived] = useState(false);

    const canCreate = can("createService");
    const canEdit = can("updateService");
    const canDelete = can("deleteService");
    const today = toDateKey(new Date());
    const archivedCount = services.filter((s) => !s.isActive).length;
    const shown = showArchived ? services : services.filter((s) => s.isActive);

    async function handleDelete(s: Service) {
        setDeleteError(null);
        if (confirmId !== s.id) return setConfirmId(s.id);
        try {
            await deleteService(s.id).unwrap();
        } catch (err) {
            setDeleteError((err as GraphqlError).message);
        } finally {
            setConfirmId(null);
        }
    }

    return (
        <section className="card manage-card" aria-labelledby="services-heading">
            <div className="manage-card__header">
                <h2 id="services-heading">Services</h2>
                <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setEditing("new")}
                    disabled={!canCreate}
                    title={canCreate ? undefined : "Your account can't add services"}
                >
                    + Add service
                </button>
            </div>

            {permsError && (
                <p className="alert" role="alert">
                    Couldn&apos;t check your permissions: {permsError.message}
                </p>
            )}
            {!permsLoading && !permsError && !canCreate && !canEdit && (
                <p className="muted small">
                    Your account can&apos;t change services. Ask an admin for the{" "}
                    <code>createService</code> / <code>updateService</code> permissions.
                </p>
            )}
            {isLoading && <Loader label="Loading services…" />}
            {error && <p className="alert">{(error as GraphqlError).message}</p>}
            {deleteError && (
                <p className="alert" role="alert">
                    {deleteError}
                </p>
            )}

            {!isLoading && !error && services.length === 0 && (
                <p className="muted">No services yet.</p>
            )}

            {shown.length > 0 && (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Price today</th>
                                <th>Next change</th>
                                <th>
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {shown.map((s) => {
                                const now = currentPrices(s);
                                const upcoming = s.prices
                                    .filter((p) => p.validFrom > today)
                                    .sort((a, b) => a.validFrom.localeCompare(b.validFrom))[0];
                                return (
                                    <tr key={s.id}>
                                        <td>
                                            {s.name}{" "}
                                            {!s.isActive && <span className="badge">Archived</span>}
                                        </td>
                                        <td>
                                            {now.length ? (
                                                <ul className="plain-list">
                                                    {now.map((p) => (
                                                        <li key={p.id}>{describeRule(p)}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="muted">No price today</span>
                                            )}
                                        </td>
                                        <td>
                                            {upcoming
                                                ? `${shortDate(upcoming.validFrom)} · ${describeRule(upcoming)}`
                                                : "—"}
                                        </td>
                                        <td>
                                            <div className="row-actions">
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        className="btn btn--ghost btn--sm"
                                                        onClick={() => setEditing(s)}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        className="btn btn--danger btn--sm"
                                                        onClick={() => handleDelete(s)}
                                                        onBlur={() =>
                                                            setConfirmId((id) =>
                                                                id === s.id ? null : id,
                                                            )
                                                        }
                                                        disabled={deleteState.isLoading}
                                                    >
                                                        {confirmId === s.id
                                                            ? "Confirm delete"
                                                            : "Delete"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {archivedCount > 0 && (
                <label className="check muted small">
                    <input
                        type="checkbox"
                        checked={showArchived}
                        onChange={(e) => setShowArchived(e.target.checked)}
                    />
                    Show {archivedCount} archived service{archivedCount === 1 ? "" : "s"}
                </label>
            )}

            <ServiceDialog target={editing} onClose={() => setEditing(null)} />
        </section>
    );
}
