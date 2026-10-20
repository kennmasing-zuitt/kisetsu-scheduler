"use client";

import { useState } from "react";
import { useDeleteRoomMutation, useGetRoomsQuery } from "@/mods/schedule/scheduleApi";
import { usePermissions } from "@/mods/auth/usePermissions";
import type { Room } from "@/mods/schedule/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";
import Loader from "@/components/ui/Loader";
import RoomDialog from "./RoomDialog";

/** Rooms as a table: add, edit (name, color) and delete. */
export default function ManageRooms() {
    const { data: rooms = [], isLoading, error } = useGetRoomsQuery();
    const [deleteRoom, deleteState] = useDeleteRoomMutation();
    const { can } = usePermissions();

    const [editing, setEditing] = useState<Room | "new" | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const canEdit = can("updateRoom");
    const canDelete = can("deleteRoom");

    async function handleDelete(r: Room) {
        setDeleteError(null);
        if (confirmId !== r.id) return setConfirmId(r.id);
        try {
            await deleteRoom(r.id).unwrap();
        } catch (err) {
            setDeleteError((err as GraphqlError).message);
        } finally {
            setConfirmId(null);
        }
    }

    return (
        <section className="card manage-card" aria-labelledby="rooms-heading">
            <div className="manage-card__header">
                <h2 id="rooms-heading">Rooms</h2>
                {can("createRoom") && (
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => setEditing("new")}
                    >
                        + Add room
                    </button>
                )}
            </div>

            {isLoading && <Loader label="Loading rooms…" />}
            {error && <p className="alert">{(error as GraphqlError).message}</p>}
            {deleteError && (
                <p className="alert" role="alert">
                    {deleteError}
                </p>
            )}

            {!isLoading && !error && rooms.length === 0 && <p className="muted">No rooms yet.</p>}

            {rooms.length > 0 && (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Room</th>
                                <th>Color</th>
                                <th>
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((r) => (
                                <tr key={r.id}>
                                    <td>
                                        <i className="swatch" style={{ background: r.color }} />
                                        {r.name}
                                    </td>
                                    <td>
                                        <code>{r.color}</code>
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    className="btn btn--ghost btn--sm"
                                                    onClick={() => setEditing(r)}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    className="btn btn--danger btn--sm"
                                                    onClick={() => handleDelete(r)}
                                                    onBlur={() =>
                                                        setConfirmId((id) =>
                                                            id === r.id ? null : id,
                                                        )
                                                    }
                                                    disabled={deleteState.isLoading}
                                                >
                                                    {confirmId === r.id
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

            <RoomDialog target={editing} onClose={() => setEditing(null)} />
        </section>
    );
}
