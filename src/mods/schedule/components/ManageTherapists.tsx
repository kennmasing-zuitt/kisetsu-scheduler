"use client";

import { useState } from "react";
import { useDeleteTherapistMutation, useGetTherapistsQuery } from "@/mods/schedule/scheduleApi";
import { WEEKDAY_LABELS, toDateKey } from "@/mods/schedule/lib/availability";
import { usePermissions } from "@/mods/auth/usePermissions";
import type { Therapist } from "@/mods/schedule/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";
import Loader from "@/components/ui/Loader";
import TherapistDialog from "./TherapistDialog";

/** The roster as a table: add, edit (name, days off, leave) and delete therapists. */
export default function ManageTherapists() {
    const { data: therapists = [], isLoading, error } = useGetTherapistsQuery();
    const [deleteTherapist, deleteState] = useDeleteTherapistMutation();
    const { can, isLoading: permsLoading, error: permsError } = usePermissions();
    const canCreate = can("createTherapist");

    const [editing, setEditing] = useState<Therapist | "new" | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const today = toDateKey(new Date());
    const canEdit = can("updateTherapist");
    const canDelete = can("deleteTherapist");

    async function handleDelete(t: Therapist) {
        setDeleteError(null);
        if (confirmId !== t.id) return setConfirmId(t.id);
        try {
            await deleteTherapist(t.id).unwrap();
        } catch (err) {
            setDeleteError((err as GraphqlError).message);
        } finally {
            setConfirmId(null);
        }
    }

    return (
        <section className="card manage-card" aria-labelledby="therapists-heading">
            <div className="manage-card__header">
                <h2 id="therapists-heading">Therapists</h2>
                <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setEditing("new")}
                    disabled={!canCreate}
                    title={canCreate ? undefined : "Your account can't add therapists"}
                >
                    + Add therapist
                </button>
            </div>

            {permsError && (
                <p className="alert" role="alert">
                    Couldn&apos;t check your permissions: {permsError.message}
                </p>
            )}
            {!permsLoading && !permsError && !canCreate && (
                <p className="muted small">
                    Your account can&apos;t add therapists. Ask an admin for the{" "}
                    <code>createTherapist</code> permission, or sign in as an admin.
                </p>
            )}

            {isLoading && <Loader label="Loading therapists…" />}
            {error && <p className="alert">{(error as GraphqlError).message}</p>}
            {deleteError && (
                <p className="alert" role="alert">
                    {deleteError}
                </p>
            )}

            {!isLoading && !error && therapists.length === 0 && (
                <p className="muted">No therapists yet.</p>
            )}

            {therapists.length > 0 && (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Days off</th>
                                <th>Upcoming leave</th>
                                <th>
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {therapists.map((t) => {
                                const leave = t.leaveDates.filter((d) => d >= today);
                                return (
                                    <tr key={t.id}>
                                        <td>{t.name}</td>
                                        <td>
                                            {t.offDays.length
                                                ? t.offDays.map((d) => WEEKDAY_LABELS[d]).join(", ")
                                                : "—"}
                                        </td>
                                        <td>
                                            {leave.length
                                                ? `${leave.length} day${leave.length === 1 ? "" : "s"} · next ${new Date(`${leave[0]}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                                                : "—"}
                                        </td>
                                        <td>
                                            <div className="row-actions">
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        className="btn btn--ghost btn--sm"
                                                        onClick={() => setEditing(t)}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        className="btn btn--danger btn--sm"
                                                        onClick={() => handleDelete(t)}
                                                        onBlur={() =>
                                                            setConfirmId((id) =>
                                                                id === t.id ? null : id,
                                                            )
                                                        }
                                                        disabled={deleteState.isLoading}
                                                    >
                                                        {confirmId === t.id
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

            <TherapistDialog target={editing} onClose={() => setEditing(null)} />
        </section>
    );
}
