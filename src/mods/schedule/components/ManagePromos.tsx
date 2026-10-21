"use client";

import { useState } from "react";
import {
    useDeletePromoMutation,
    useGetPromosQuery,
    useGetServicesQuery,
    useUpdatePromoMutation,
} from "@/mods/schedule/scheduleApi";
import { usePermissions } from "@/mods/auth/usePermissions";
import { describeDiscount } from "@/mods/schedule/lib/promos";
import { toDateKey } from "@/mods/schedule/lib/availability";
import type { Promo } from "@/mods/schedule/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";
import Loader from "@/components/ui/Loader";
import PromoDialog, { type PromoTarget } from "./PromoDialog";

const shortDate = (key: string) =>
    new Date(`${key}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

/** Promo codes: add, edit, duplicate, archive / activate any time, delete when unused. */
export default function ManagePromos() {
    const { data: promos = [], isLoading, error } = useGetPromosQuery(true);
    const { data: services = [] } = useGetServicesQuery(true);
    const [updatePromo, updateState] = useUpdatePromoMutation();
    const [deletePromo, deleteState] = useDeletePromoMutation();
    const { can } = usePermissions();

    const [target, setTarget] = useState<PromoTarget>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [showArchived, setShowArchived] = useState(false);

    const canCreate = can("createPromo");
    const canEdit = can("updatePromo");
    const canDelete = can("deletePromo");
    const today = toDateKey(new Date());
    const serviceName = new Map(services.map((s) => [s.id, s.name]));
    const archivedCount = promos.filter((p) => !p.isActive).length;
    const shown = showArchived ? promos : promos.filter((p) => p.isActive);

    async function run(action: () => Promise<unknown>) {
        setActionError(null);
        try {
            await action();
        } catch (err) {
            setActionError((err as GraphqlError).message);
        }
    }

    function status(p: Promo) {
        if (!p.isActive) return <span className="badge">Archived</span>;
        if (p.validTo && p.validTo < today) return <span className="badge">Ended</span>;
        if (p.validFrom > today) return <span className="badge">Upcoming</span>;
        return <span className="badge badge--on">Active</span>;
    }

    return (
        <section className="card manage-card" aria-labelledby="promos-heading">
            <div className="manage-card__header">
                <h2 id="promos-heading">Promo codes</h2>
                <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setTarget({})}
                    disabled={!canCreate}
                    title={canCreate ? undefined : "Your account can't add promos"}
                >
                    + Add promo
                </button>
            </div>

            {isLoading && <Loader label="Loading promos…" />}
            {error && <p className="alert">{(error as GraphqlError).message}</p>}
            {actionError && (
                <p className="alert" role="alert">
                    {actionError}
                </p>
            )}
            {!isLoading && !error && promos.length === 0 && (
                <p className="muted">No promo codes yet.</p>
            )}

            {shown.length > 0 && (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Valid</th>
                                <th>Services</th>
                                <th className="num">Used</th>
                                <th>
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {shown.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <strong>{p.code}</strong> {status(p)}
                                        {p.description && (
                                            <div className="muted small">{p.description}</div>
                                        )}
                                    </td>
                                    <td>{describeDiscount(p)}</td>
                                    <td>
                                        {shortDate(p.validFrom)} –{" "}
                                        {p.validTo ? shortDate(p.validTo) : "no end"}
                                    </td>
                                    <td>
                                        {p.serviceIds.length
                                            ? p.serviceIds
                                                  .map((id) => serviceName.get(id) ?? "?")
                                                  .join(", ")
                                            : "All"}
                                    </td>
                                    <td
                                        className="num"
                                        title={
                                            p.isLocked
                                                ? "Terms locked: used by bookings"
                                                : undefined
                                        }
                                    >
                                        {p.timesUsed}
                                        {p.isLocked ? " 🔒" : ""}
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    className="btn btn--ghost btn--sm"
                                                    onClick={() => setTarget({ promo: p })}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            {canCreate && p.isLocked && (
                                                <button
                                                    type="button"
                                                    className="btn btn--ghost btn--sm"
                                                    onClick={() => setTarget({ copyOf: p })}
                                                >
                                                    Duplicate
                                                </button>
                                            )}
                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    className="btn btn--ghost btn--sm"
                                                    disabled={updateState.isLoading}
                                                    onClick={() =>
                                                        run(() =>
                                                            updatePromo({
                                                                id: p.id,
                                                                input: { isActive: !p.isActive },
                                                            }).unwrap(),
                                                        )
                                                    }
                                                >
                                                    {p.isActive ? "Archive" : "Activate"}
                                                </button>
                                            )}
                                            {canDelete && !p.isLocked && (
                                                <button
                                                    type="button"
                                                    className="btn btn--danger btn--sm"
                                                    disabled={deleteState.isLoading}
                                                    onBlur={() =>
                                                        setConfirmId((id) =>
                                                            id === p.id ? null : id,
                                                        )
                                                    }
                                                    onClick={() => {
                                                        if (confirmId !== p.id)
                                                            return setConfirmId(p.id);
                                                        setConfirmId(null);
                                                        void run(() => deletePromo(p.id).unwrap());
                                                    }}
                                                >
                                                    {confirmId === p.id
                                                        ? "Confirm delete"
                                                        : "Delete"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
                    Show {archivedCount} archived promo{archivedCount === 1 ? "" : "s"}
                </label>
            )}

            <PromoDialog target={target} onClose={() => setTarget(null)} />
        </section>
    );
}
